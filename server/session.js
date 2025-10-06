const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redis = require('redis');
const { REDIS_URL, SESSION_SECRET } = process.env;

const redisClient = redis.createClient(REDIS_URL);

redisClient.on('error', (err) => console.log('Redis Client Error', err));

module.exports = session({
    store: new RedisStore({ client: redisClient }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
});
