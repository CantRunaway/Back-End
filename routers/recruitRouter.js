const express = require('express');
const router = express.Router();
const connection = require("../config/mysql");
const status = require("../config/recruitStatus");

router.get("/", async(req, res) => {
    await connection.query(`SELECT r.recruit_index, wt.work_type_name, r.recruit_state, r.work_start, r.work_end, r.recruit_worker, r.applyment_worker FROM Recruit r
    LEFT JOIN work_type wt
     ON r.work_type_index = wt.work_type_index
     WHERE r.recruit_state = '${status.waiting}'`, (err, rows) => {
        if (err) throw err;
        console.log(rows);
        res.send(rows);
     })
})

router.post("/", async(req, res) => {
    const {work_type_index, work_start, work_end, recruit_worker, applyment_worker} = req.body;
    await connection.query(`Insert Into Recruit(work_type_index, recruit_state, work_start, work_end, recruit_worker, applyment_worker) values ('${work_type_index}', '${status.waiting}','${work_start}', '${work_end}', '${recruit_worker}', '${applyment_worker}')`, (err, rows) => {
        if(err) throw err;
        console.log(rows);
        res.send(rows);
    })
});

router.post("/delete", async(req, res) => {
    const {recruit_index} = req.body;
    await connection.query(`Delete from Recruit Where recruit_index = '${recruit_index}'`, (err, rows) => {
        if (err) throw err;
        console.log(rows);
        res.send(rows);
    })
});

module.exports = router;