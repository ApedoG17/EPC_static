const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const { createClient } = require('redis');
const { setupSecurity } = require('./middleware/security');
const { logger } = require('./utils/logger');
const MonitoringService = require('./services/monitoring');

const app = express();

// Redis client setup
const redisClient = createClient({
    url: process.env.REDIS_URL,
    legacyMode: true
});

redisClient.connect().catch(console.error);

// Session middleware setup
app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize monitoring service
const monitoring = new MonitoringService();
monitoring.scheduleCleanup();

// Export for use in server.js
module.exports = { app, monitoring };
