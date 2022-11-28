const express = require('express');
const router = express.Router();
const pool = require("../config/connectionPool");
const status = require('../config/applyStatus');
const recruitStatus = require('../config/recruitStatus');

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

//프로시져 요청

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

router.get("/:user_id", async(req, res) => {
    const user_id = req.params.user_id;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [result] = await connection.query(`select o.overtime_index, u.name, date_format(r.work_start, '%Y-%m-%d %H:%i') as work_start, date_format(r.work_end, '%Y-%m-%d %H:%i') as work_end, wt.work_type_name, r.recruit_state, '추가근로' as type from overtime o
        join user u, recruit r, work_type wt
        where o.user_index = u.user_index
        and u.user_id = '${user_id}'
        and o.recruit_index = r.recruit_index
        and r.work_type_index = wt.work_type_index`);

        return res.status(200).json(result);
    }catch (err) {
        return res.status(400).json(err);
    }finally {
        connection.release();
    }
})

router.post("/request/:user_id", async(req, res) => {
    const ids = req.body;
    const user_id = req.params.user_id;
    let arr = [];
    
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.query(`select user_index from user where user_id = '${user_id}'`);
        for (let i = 0; i < ids.length; i++) {
            arr.push([`${status.waiting}`, `${result[0].user_index}`, `${ids[i].recruit_index}`]);
            console.log(arr[i]);
        }

        const results = await connection.query(`insert into overtime (cover_state, user_index, recruit_index) values ?`, [arr]);


        await connection.commit();
        return res.status(200).json(results);
    }catch(err) {
        await connection.rollback();
        return res.status(400).json(err);
    }finally{
        connection.release();
    }
})

module.exports = router;