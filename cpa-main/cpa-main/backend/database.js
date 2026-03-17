const { Pool } = require('pg'); // Importe o pacote pg
require('dotenv').config(); // Importe o pacote dotenv


const pool = new Pool({
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    password: process.env.DATABASE_PASSWORD,
    user: process.env.DATABASE_USER,
    port: process.env.DATABASE_PORT,
});



module.exports = pool;
