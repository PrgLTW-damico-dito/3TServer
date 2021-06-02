const Pool = require('pg').Pool
const cs = `postgres://hkeceooamvidfb:650020c30ffdc43434c6dec4fcc764db573f154044cd71da2b8a94a76fe86fa1@ec2-54-228-139-34.eu-west-1.compute.amazonaws.com:5432/d6kvrhci1v2hkc`;
const pool = new Pool({
    connectionString: cs,
    connectionTimeoutMillis: 5000,
    ssl:{
        rejectUnauthorized: false
    }

});

module.exports = pool;