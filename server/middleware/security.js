const rateLimit = require('express-rate-limit');
const csrf = require('csurf');
const helmet = require('helmet');
const xss = require('xss-clean');
const sanitize = require('express-mongo-sanitize');
const config = require('../config');

const limiter = rateLimit(config.RATE_LIMIT);

const csrfProtection = csrf({ 
    cookie: {
        secure: true,
        httpOnly: true,
        sameSite: 'strict'
    }
});

module.exports = {
    setupSecurity: (app) => {
        app.use(helmet());
        app.use(xss());
        app.use(sanitize());
        app.use(limiter);
        app.use(csrfProtection);
        
        // Add security headers
        app.use((req, res, next) => {
            res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
            res.setHeader('Content-Security-Policy', "default-src 'self'");
            next();
        });
    }
};
