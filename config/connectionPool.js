const mysql = require('mysql2/promise');
const config = require("./database");

const pool = mysql.createPool(config);

module.exports = pool;