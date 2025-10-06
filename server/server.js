const express = require('express');
const https = require('https');
const { setupSecurity } = require('./middleware/security');
const { logger, paymentLogger } = require('./utils/logger');
const config = require('./config');

const app = express();
app.use(express.json());

// Verify Paystack payment
app.post('/verify-payment', async (req, res) => {
    try {
        const { reference, orderDetails } = req.body;
        
        // Input validation
        if (!reference || !orderDetails) {
            throw new Error('Invalid payment data');
        }

        // Track failed payment attempts
        const failedAttempts = await getFailedAttempts(orderDetails.customerEmail);
        if (failedAttempts >= config.FAILED_PAYMENT_THRESHOLD) {
            throw new Error('Payment verification temporarily blocked');
        }
        
        const verificationResult = await verifyPaystackPayment(reference);
        
        if (verificationResult.status === 'success') {
            paymentLogger.logTransaction({
                reference,
                status: 'success',
                ...orderDetails
            });
            
            // Generate secure download link if digital product
            if (orderDetails.format === 'digital') {
                const downloadToken = generateDownloadToken(orderDetails.bookId);
                res.json({
                    status: 'success',
                    downloadUrl: `/download/${orderDetails.bookId}?token=${downloadToken}`
                });
            } else {
                res.json({ status: 'success' });
            }
        } else {
            throw new Error('Payment verification failed');
        }
    } catch (error) {
        paymentLogger.logFailedPayment(error, req.body);
        
        // Increment failed attempts counter
        await incrementFailedAttempts(req.body.orderDetails.customerEmail);
        
        res.status(400).json({
            status: 'error',
            message: 'Payment verification failed'
        });
    }
});

// Secure download endpoint with rate limiting
app.get('/download/:bookId', 
    rateLimiter({ windowMs: 60 * 1000, max: 5 }), // 5 attempts per minute
    validateDownloadToken, 
    async (req, res) => {
        try {
            const bookId = req.params.bookId;
            const filePath = await getSecureFilePath(bookId);
            
            logger.info('Download initiated', {
                bookId,
                userId: req.user.id,
                timestamp: new Date()
            });
            
            res.download(filePath, (err) => {
                if (err) {
                    logger.error('Download failed', {
                        bookId,
                        userId: req.user.id,
                        error: err.message
                    });
                    res.status(500).send('Download failed');
                }
            });
        } catch (error) {
            logger.error('Download error', {
                error: error.message,
                bookId: req.params.bookId
            });
            res.status(500).send('Download failed');
        }
    }
);

// Start HTTPS server
https.createServer(config.SSL_OPTIONS, app)
     .listen(config.PORT, () => {
         logger.info(`Secure server running on port ${config.PORT}`);
     });

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Application error', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });
    
    res.status(500).json({
        status: 'error',
        message: 'Internal server error'
    });
});
// .update(JSON.stringify(payload))
// .digest('hex');

// Verify download token
function verifyDownloadToken(token, bookId) {
    // Implement token verification logic
    return true; // Placeholder
}

// Check if download token is expired
function isTokenExpired(decoded) {
    const now = Date.now();
    return (now - decoded.timestamp) > config.DOWNLOAD_EXPIRY;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
