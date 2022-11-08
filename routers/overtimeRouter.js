const express = require('express');
const router = express.Router();
const connection = require("../config/mysql");
const status = require('../config/applyStatus');

router.post("/", async(req, res) => {
    const {user_index, recruit_index, work_type_index} = req.body;
    await connection.query(`Insert Into Overtime(cover_state, user_index, recruit_index) values ('${status.waiting}', '${user_index}', '${recruit_index}')`, (err, rows) => {
        if(err) throw err;
        console.log(rows);
        res.send(rows);
    })
});



router.post("/response", async(req, res) => {
    const {cover_state, overtime_index} = req.body;
    await connection.query(`Update Overtime Set cover_state = '${cover_state}' WHERE overtime_index = '${overtime_index}'`, (err, rows) => {
        if(err) throw err;
        console.log(rows);
        res.send(rows);
    })
});


module.exports = router;