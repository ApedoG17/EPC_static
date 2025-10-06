const nodemailer = require('nodemailer');
const schedule = require('node-schedule');
const { logger } = require('../utils/logger');

class MonitoringService {
    constructor() {
        this.failedPayments = new Map();
        this.alertThreshold = 3;
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    async trackPaymentAttempt(paymentData, success) {
        const { email, bookId, amount } = paymentData;
        
        if (!success) {
            const attempts = (this.failedPayments.get(email) || 0) + 1;
            this.failedPayments.set(email, attempts);

            logger.warn('Failed payment attempt', {
                email,
                bookId,
                amount,
                attemptCount: attempts
            });

            if (attempts >= this.alertThreshold) {
                await this.sendAlert(email, attempts);
            }
        } else {
            // Reset failed attempts on successful payment
            this.failedPayments.delete(email);
        }
    }

    async sendAlert(email, attempts) {
        try {
            await this.transporter.sendMail({
                from: process.env.SMTP_USER,
                to: process.env.ALERT_EMAIL,
                subject: 'Payment Alert: Multiple Failed Attempts',
                html: `
                    <h3>Payment Alert</h3>
                    <p>Multiple failed payment attempts detected</p>
                    <ul>
                        <li>Email: ${email}</li>
                        <li>Failed Attempts: ${attempts}</li>
                        <li>Time: ${new Date().toISOString()}</li>
                    </ul>
                `
            });

            logger.info('Payment alert sent', { email, attempts });
        } catch (error) {
            logger.error('Failed to send alert email', { error: error.message });
        }
    }

    scheduleCleanup() {
        // Clear failed attempts daily at midnight
        schedule.scheduleJob('0 0 * * *', () => {
            this.failedPayments.clear();
            logger.info('Failed payments tracking reset');
        });
    }

    getFailedAttempts(email) {
        return this.failedPayments.get(email) || 0;
    }
}

module.exports = MonitoringService;
