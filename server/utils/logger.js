const winston = require('winston');
const path = require('path');
const config = require('../config');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ 
            filename: path.join(config.LOG_PATH, 'error.log'), 
            level: 'error' 
        }),
        new winston.transports.File({ 
            filename: path.join(config.LOG_PATH, 'payments.log'),
            level: 'info'
        })
    ]
});

const paymentLogger = {
    logTransaction: (transactionData) => {
        logger.info('Payment Transaction', {
            type: 'PAYMENT',
            ...transactionData
        });
    },
    
    logFailedPayment: (error, transactionData) => {
        logger.error('Payment Failed', {
            type: 'PAYMENT_FAILED',
            error: error.message,
            ...transactionData
        });
    }
};

module.exports = { logger, paymentLogger };
