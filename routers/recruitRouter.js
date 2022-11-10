const express = require('express');
const router = express.Router();
const pool = require("../config/connectionPool");
const status = require("../config/recruitStatus");

router.get("/", async(req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
    const [result] = await connection.query(`SELECT r.recruit_index, wt.work_type_name, r.recruit_state, r.work_start, r.work_end, r.recruit_worker, r.applyment_worker FROM Recruit r
    LEFT JOIN work_type wt
     ON r.work_type_index = wt.work_type_index
     WHERE r.recruit_state = '${status.waiting}'`);

     await connection.commit();
     return res.json(result);
    }catch(err) {
        await connection.rollback();
        return res.status(400).json(err);
    }finally {
        connection.release();
    }
})

router.post("/", async(req, res) => {
    const {work_type_index, work_start, work_end, recruit_worker, applyment_worker} = req.body;
    const connecttion = await pool.getConnection();
    try {
        await connecttion.beginTransaction();

        const result = await connection.query(`Insert Into Recruit(work_type_index, recruit_state, work_start, work_end, recruit_worker, applyment_worker) values ('${work_type_index}', '${status.waiting}','${work_start}', '${work_end}', '${recruit_worker}', '${applyment_worker}')`);

        await connecttion.commit();
        return res.json(result);
    }catch(err) {
        await connecttion.rollback();
        return res.status(400).json(err);
    }finally {
        connecttion.release();
    }
    
});

router.post("/delete", async(req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const result = await connection.query(`Delete from Recruit Where recruit_index = '${recruit_index}'`);

        await connection.commit();
        return res.json(result);
    }catch(err) {
        await connection.rollback();
        return res.status(400).json(err);
    }finally {
        connection.release();
    }
    
});

module.exports = router;