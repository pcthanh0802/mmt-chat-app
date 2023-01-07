require('dotenv').config();
const mysql = require('mysql2');

const conn = mysql.createPool(process.env.DB);

module.exports = conn;