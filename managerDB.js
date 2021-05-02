const Pool = require('pg').Pool
const cs = `postgres://ciszuzhtyjsqny:3f17229e64c957e7a16d484ece156b06c7a93430646fb0cd4a010e58a97c3df5@ec2-54-155-226-153.eu-west-1.compute.amazonaws.com:5432/d9nihgkb5cqtlo`;
const pool = new Pool({
    connectionString: cs,
    connectionTimeoutMillis: 5000,
    ssl:{
        rejectUnauthorized: false
    }

});

module.exports = pool;