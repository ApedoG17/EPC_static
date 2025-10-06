module.exports = {
    PAYSTACK_SECRET_KEY: 'sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Replace with your secret key
    PAYSTACK_PUBLIC_KEY: 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Replace with your public key
    DOWNLOAD_SECRET: 'your-secure-download-secret-key',
    DOWNLOAD_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    RATE_LIMIT: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
    },
    CSRF_SECRET: process.env.CSRF_SECRET || 'your-csrf-secret-key',
    SSL_OPTIONS: {
        key: '/path/to/private.key',
        cert: '/path/to/certificate.crt'
    },
    LOG_PATH: './logs',
    FAILED_PAYMENT_THRESHOLD: 3 // Number of failed attempts before additional verification
};
