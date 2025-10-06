/**
 * server.js
 * Secure Express server with Paystack integration and secure file downloads.
 *
 * Notes:
 * - This example uses axios to call Paystack.
 * - For webhook verification we compute HMAC SHA512 of the raw JSON body using PAYSTACK_SECRET_KEY
 *   and compare to the X-Paystack-Signature header.
 * - Download links are signed with a short expiration using DOWNLOAD_SECRET_KEY.
 *
 * Make sure to:
 * - keep .env out of git
 * - run HTTPS in production (use reverse proxy like nginx or a cloud load balancer / cert manager)
 */

import fs from "fs";
import path from "path";
import https from "https";
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import crypto from "crypto";
import Joi from "joi";
import winston from "winston";
import morgan from "morgan";

dotenv.config();

const {
  PORT = 443,
  PAYSTACK_SECRET_KEY,
  PAYSTACK_BASE = "https://api.paystack.co",
  DOWNLOAD_SECRET_KEY,
  NODE_ENV = "production",
  SSL_KEY_PATH,
  SSL_CERT_PATH
} = process.env;

if (!PAYSTACK_SECRET_KEY) {
  console.error("PAYSTACK_SECRET_KEY missing in .env");
  process.exit(1);
}

if (!DOWNLOAD_SECRET_KEY) {
  console.error("DOWNLOAD_SECRET_KEY missing in .env");
  process.exit(1);
}

/* ---------- Logger ---------- */
const logger = winston.createLogger({
  level: NODE_ENV === "development" ? "debug" : "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" })
  ],
});

if (NODE_ENV === "development") {
  logger.add(new winston.transports.Console({ format: winston.format.simple() }));
}

/* ---------- App setup ---------- */
const app = express();

/**
 * We need access to raw body for webhook signature verification.
 * Save raw buffer on req.rawBody in the verify hook.
 */
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  },
  limit: "200kb"
}));
app.use(express.urlencoded({ extended: true }));

app.use(helmet()); // basic security headers

// request logging to console & winston via morgan
app.use(morgan("combined", {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

/* ---------- Rate limiting ---------- */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 120, // max requests per window per IP
  standardHeaders: true,
  legacyHeaders: false
});
app.use(apiLimiter);

/* ---------- Helpers ---------- */

const paystackClient = axios.create({
  baseURL: PAYSTACK_BASE,
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
});

// Create HMAC SHA512 (Paystack uses SHA512)
function computePaystackSignature(payloadBuffer) {
  return crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(payloadBuffer)
    .digest("hex");
}

/* ---------- Simple input validation schemas ---------- */

const initSchema = Joi.object({
  email: Joi.string().email().required(),
  amount: Joi.number().integer().positive().required(), // kobo for NGN or smallest currency unit
  reference: Joi.string().alphanum().min(6).max(64).optional(),
  // add other fields as required
});

/* ---------- Secure downloads setup ---------- */
/**
 * Files stored in a folder outside public: ./private_downloads
 * Download links are generated as: /download/:fileId?token=...
 * token = HMAC(DOWNLOAD_SECRET_KEY, `${fileId}:${expiryTimestamp}`)
 */

const DOWNLOADS_DIR = path.resolve("./private_downloads");
if (!fs.existsSync(DOWNLOADS_DIR)) fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });

// generate signed token for a file id
function signDownloadToken(fileId, expiresAt) {
  const payload = `${fileId}:${expiresAt}`;
  const sig = crypto.createHmac("sha256", DOWNLOAD_SECRET_KEY).update(payload).digest("hex");
  return Buffer.from(`${expiresAt}:${sig}`).toString("base64url");
}

function verifyDownloadToken(fileId, token) {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [expiresAtStr, sig] = decoded.split(":");
    const expiresAt = Number(expiresAtStr);
    if (!expiresAt || !sig) return false;
    if (Date.now() > expiresAt) return false;
    const expected = crypto.createHmac("sha256", DOWNLOAD_SECRET_KEY).update(`${fileId}:${expiresAt}`).digest("hex");
    // timing-safe compare
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch (err) {
    return false;
  }
}

/* ---------- Routes ---------- */

/**
 * Health
 */
app.get("/health", (req, res) => {
  res.json({ status: "ok", env: NODE_ENV });
});

/**
 * Initialize a Paystack transaction
 * Body: { email, amount, reference? }
 */
app.post("/pay/init", async (req, res) => {
  try {
    const { error, value } = initSchema.validate(req.body, { stripUnknown: true });
    if (error) {
      logger.warn("Invalid init payload", { err: error.message });
      return res.status(400).json({ error: error.message });
    }
    const { email, amount, reference } = value;

    // Build payload to Paystack - note: amount usually expected in kobo (i.e. smallest unit)
    const payload = {
      email,
      amount,
      reference,
      // callback_url: 'https://yourdomain.com/pay/callback' // optional if you use webhooks
    };

    const r = await paystackClient.post("/transaction/initialize", payload);
    // r.data contains Paystack response; pass it back to client
    res.json(r.data);
  } catch (err) {
    logger.error("Paystack init error", { message: err.message, stack: err.stack });
    res.status(500).json({ error: "Failed to initialize payment" });
  }
});

/**
 * Webhook endpoint (Paystack will POST here).
 * MUST use raw body to compute signature.
 */
app.post("/webhook/paystack", (req, res) => {
  try {
    const signature = req.headers["x-paystack-signature"];
    if (!signature) {
      logger.warn("Missing x-paystack-signature");
      return res.status(400).send("Missing signature");
    }

    const computed = computePaystackSignature(req.rawBody || Buffer.from(""));

    if (!crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature))) {
      logger.warn("Invalid paystack signature");
      return res.status(400).send("Invalid signature");
    }

    const event = req.body;
    // TODO: process event according to type
    // e.g. event.event === 'charge.success' -> confirm payment in DB, issue access, send email, etc.
    logger.info("Received valid Paystack webhook", { event: event.event, data: event.data });

    // IMPORTANT: acknowledge quickly
    res.status(200).send("ok");
  } catch (err) {
    logger.error("Webhook processing error", { message: err.message, stack: err.stack });
    res.status(500).send("error");
  }
});

/**
 * Create a short-lived signed download URL for a file we store in private_downloads.
 * Body: { fileId, ttlSeconds }
 * In real system: authenticate user & check authorization to download fileId.
 */
app.post("/download/generate", (req, res) => {
  // TODO: replace this naive auth check with real user session/auth middleware
  const { fileId, ttlSeconds = 60 } = req.body || {};
  if (!fileId) return res.status(400).json({ error: "fileId required" });

  // ensure file exists
  const safeFile = path.join(DOWNLOADS_DIR, path.basename(fileId)); // basic safety: basename
  if (!fs.existsSync(safeFile)) return res.status(404).json({ error: "file not found" });

  const expiresAt = Date.now() + Number(ttlSeconds) * 1000;
  const token = signDownloadToken(fileId, expiresAt);

  const url = `${req.protocol}://${req.get("host")}/download/${encodeURIComponent(fileId)}?token=${encodeURIComponent(token)}`;
  res.json({ url, expiresAt });
});

/**
 * Serve the file if token valid.
 * GET /download/:fileId?token=...
 */
app.get("/download/:fileId", (req, res) => {
  try {
    const { fileId } = req.params;
    const { token } = req.query;
    if (!token) return res.status(400).send("token required");
    if (!verifyDownloadToken(fileId, token)) {
      logger.warn("Invalid or expired download token", { fileId, ip: req.ip });
      return res.status(403).send("Forbidden or expired");
    }
    const safeFile = path.join(DOWNLOADS_DIR, path.basename(fileId));
    if (!fs.existsSync(safeFile)) return res.status(404).send("Not found");

    // Set headers (optional): Content-Disposition to force download
    res.download(safeFile, path.basename(safeFile), (err) => {
      if (err) logger.error("Download error", { err: err.message });
    });
  } catch (err) {
    logger.error("Download route error", { message: err.message });
    res.status(500).send("error");
  }
});

/* ---------- Generic error handler ---------- */
app.use((err, req, res, next) => {
  logger.error("Unhandled error", { message: err.message, stack: err.stack });
  res.status(500).json({ error: "Internal server error" });
});

/* ---------- Start server (HTTPs if certs provided) ---------- */
if (SSL_KEY_PATH && SSL_CERT_PATH && fs.existsSync(SSL_KEY_PATH) && fs.existsSync(SSL_CERT_PATH)) {
  const key = fs.readFileSync(SSL_KEY_PATH);
  const cert = fs.readFileSync(SSL_CERT_PATH);
  https.createServer({ key, cert }, app).listen(PORT, () => {
    logger.info(`HTTPS server running on port ${PORT}`);
    console.log(`HTTPS server running on port ${PORT}`);
  });
} else {
  // If not provided, start an HTTP server. In production, use HTTPS (reverse proxy or cert).
  app.listen(PORT, () => {
    logger.info(`HTTP server running on port ${PORT}`);
    console.log(`HTTP server running on port ${PORT}`);
  });
}
