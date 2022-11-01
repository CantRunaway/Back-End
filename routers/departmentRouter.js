const express = require('express');
const router = express.Router();
const connection = require("../config/mysql");

router.get("/", async (req, res) => {
    await connection.query(`Select * from department`, (err, rows) => {
        if (err) throw err;
        console.log(rows);
        res.send(rows);
    })
})

module.exports = router;