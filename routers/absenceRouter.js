const express = require('express');
const router = express.Router();
const connection = require("../config/mysql");
const status = require('../config/applyStatus');
const e = require('express');

router.post("/", async(req, res) => {
    const {absence_start, absence_end, user_index} = req.body;
    await connection.beginTransaction((err) => {
        connection.query(`Insert Into Absence(absence_state, absence_start, absence_end, user_index) values ('${status.waiting}', '${absence_start}', '${absence_end}', '${user_index}')`, (err, rows) => {
            if(err) throw err;
            console.log(rows);
            res.send(rows);
        })
    }, () => {
        if(err)
            connection.rollback();
        else
            connection.commit();
    })
    
});

router.post("/response", async(req, res) => {
    const {absence_state, absence_index} = req.body;
    await connection.query(`Update Absence Set absence_state = '${absence_state}' WHERE absence_index = '${absence_index}'`, (err, rows) => {
        if(err) throw err;
        console.log(rows);
        res.send(rows);
    })
});

module.exports = router;