const express = require('express');
const router = express.Router();
const connection = require("../config/mysql");

const getScheduleIndex = (time) => {
    const times = time.split(":");
    const index = parseInt(times[0]) * 2;

    return parseInt(times[1]) == 30 ? index + 2 : index + 1;
}

router.get("/", async (req, res) => {
    await connection.query(`Select * from schedule`, (err, rows) => {
        if (err) throw err;
        console.log(rows);
        res.send(rows);
    })
})

module.exports = router;