var redis = require('redis');

module.exports = redis.createClient({
    host: '0.0.0.0',
});