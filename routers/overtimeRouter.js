const express = require('express');
const router = express.Router();
const pool = require("../config/connectionPool");
const status = require('../config/applyStatus');

router.post("/", async(req, res) => {
    const {user_index, recruit_index} = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const result = await connection.query(`Insert Into Overtime(cover_state, user_index, recruit_index) values ('${status.waiting}', '${user_index}', '${recruit_index}')`);

        await connection.commit();
        return res.json(result);
    }catch(err) {
        await connection.rollback();
        return res.status(400).json(err);
    }finally {
        connection.release();
    }
});



router.post("/response", async(req, res) => {
    const {cover_state, overtime_index} = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const result = await connection.query(`Update Overtime Set cover_state = '${cover_state}' WHERE overtime_index = '${overtime_index}'`);

        await connection.commit();
        return res.json(result);
    }catch(err) {
        await connection.rollback();
        return res.status(400).json(err);
    }finally {
        connection.release();
    }
    
});

router.get("/", async(req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [result] = await connection.query(`select o.overtime_index, u.name, u.user_id, date_format(r.work_start, '%Y-%m-%d %H:%i:%s') as work_start, date_format(r.work_end, '%Y-%m-%d %H:%i:%s') as work_end , w.work_type_name from domang.overtime o
        join domang.User u, domang.recruit r, domang.work_type w
        where o.user_index = u.user_index
        and o.recruit_index = r.recruit_index
        and date_format(r.work_start, '%Y-%m-%d') >= date_format(now(), '%Y-%m-%d') group by o.overtime_index`);

        return res.json(result);
    }catch(err) {
        return res.status(400).json(err);
    }finally {
        connection.release();
    }
})//오늘 임시 근로자 추출

module.exports = router;