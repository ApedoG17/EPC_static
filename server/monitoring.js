const nodemailer = require('nodemailer');
const schedule = require('node-schedule');
const { logger } = require('./utils/logger');

class MonitoringService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        this.failedPayments = new Map();
        this.alertThreshold = 3;
    }

    trackFailedPayment(email) {
        const count = (this.failedPayments.get(email) || 0) + 1;
        this.failedPayments.set(email, count);

        if (count >= this.alertThreshold) {
            this.sendAlert(email, count);
        }
    }

    async sendAlert(email, attempts) {
        try {
            await this.transporter.sendMail({
                from: process.env.SMTP_USER,
                to: process.env.ALERT_EMAIL,
                subject: 'Multiple Failed Payment Attempts Detected',
                html: `
                    <h3>Payment Alert</h3>
                    <p>Multiple failed payment attempts detected from: ${email}</p>
                    <p>Number of attempts: ${attempts}</p>
                    <p>Time: ${new Date().toISOString()}</p>
                `
            });

            logger.info('Payment alert sent', { email, attempts });
        } catch (error) {
            logger.error('Failed to send alert email', { error });
        }
    }

    // Clean up old records daily
    scheduleCleanup() {
        schedule.scheduleJob('0 0 * * *', () => {
            this.failedPayments.clear();
            logger.info('Failed payments tracking reset');
        });
    }
}

module.exports = new MonitoringService();
