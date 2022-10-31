const mysql = require("mysql");
const dbconfig = require('./database');

const connection = mysql.createConnection(dbconfig);

connection.connect(err => {
    if (err) throw err;
    console.log("DB Connected!");
});

module.exports = connection;