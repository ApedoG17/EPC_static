const express = require('express');
const router = express.Router();
const { monitoring } = require('../app');
const { logger } = require('../utils/logger');

router.post('/verify-payment', async (req, res) => {
    try {
        const { reference, paymentData } = req.body;
        
        const verificationResult = await verifyPaystackPayment(reference);
        
        // Track the payment attempt
        await monitoring.trackPaymentAttempt(paymentData, verificationResult.status === 'success');
        
        if (verificationResult.status === 'success') {
            res.json({
                status: 'success',
                data: verificationResult.data
            });
        } else {
            throw new Error('Payment verification failed');
        }
    } catch (error) {
        logger.error('Payment verification error', { error: error.message });
        res.status(400).json({
            status: 'error',
            message: 'Payment verification failed'
        });
    }
});

module.exports = router;
