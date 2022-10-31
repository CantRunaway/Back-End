const express = require('express');
const mysql = require('mysql');
const dbconfig = require('./config/database.js');
const connection = mysql.createConnection(dbconfig);

connection.connect();

const app = express();

app.set('port', process.env.PORT || 3000);

app.get('/', (req, res) => {
    res.send('Root');
})

app.get('/users', (req, res) => {
    connection.query('SELECT * from User', (error, rows) => {
        if (error) res.status(400).send({error: "Select error"});
        console.log('User info is: ', rows);
        res.send(rows);
    })
});

app.listen(3000, () => console.log('3000번 포트에서 대기중'));