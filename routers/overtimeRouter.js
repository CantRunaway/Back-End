const express = require('express');
const router = express.Router();
const pool = require("../config/connectionPool");
const status = require('../config/applyStatus');
const recruitStatus = require('../config/recruitStatus');
const restStatus = require('../config/RestStatus');

router.post("/", async(req, res) => {
    const {user_index, recruit_index} = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const result = await connection.query(`Insert Into Overtime(cover_state, user_index, recruit_index) values ('${status.waiting}', '${user_index}', '${recruit_index}')`);

        await connection.commit();
        return res.status(restStatus.success).json(result);
    }catch(err) {
        await connection.rollback();
        return res.status(restStatus.fail).json(err);
    }finally {
        connection.release();
    }
});

router.post("/admit", async (req, res) => {
    ids = req.body;
    let query = ``;

    query = `update overtime o join (select '${ids[0]}' as id, '${status.approval}' as state `;
    for (let i = 1; i < ids.length; i++) {
        query += (`union all select '${ids[i]}', '${status.approval}'`)
    }
    query += (`) vals on o.overtime_index = vals.id set cover_state = state`)

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const result = await connection.query(query);

        await connection.commit();
        return res.status(restStatus.success).json(result);
    } catch (err) {
        await connection.rollback();
        return res.status(restStatus.fail).json(err);
    } finally {
        connection.release();
    }

});

router.post("/refuse", async (req, res) => {
    ids = req.body;
    let query = ``;

    query = `update overtime o join (select '${ids[0]}' as id, '${status.refuse}' as state `;
    for (let i = 1; i < ids.length; i++) {
        query += (`union all select '${ids[i]}', '${status.refuse}'`)
    }
    query += (`) vals on o.overtime_index = vals.id set cover_state = state`)

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const result = await connection.query(query);

        await connection.commit();
        return res.status(restStatus.success).json(result);
    } catch (err) {
        await connection.rollback();
        return res.status(restStatus.fail).json(err);
    } finally {
        connection.release();
    }

})


router.post("/response", async(req, res) => {
    const {cover_state, overtime_index} = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const result = await connection.query(`Update Overtime Set cover_state = '${cover_state}' WHERE overtime_index = '${overtime_index}'`);

        await connection.commit();
        return res.status(restStatus.success).json(result);
    }catch(err) {
        await connection.rollback();
        return res.status(restStatus.fail).json(err);
    }finally {
        connection.release();
    }
    
});

//프로시져 요청

router.get("/", async(req, res) => {
    const connection = await pool.getConnection();
    try {
        
        const [result] = await connection.query(`select o.overtime_index, u.name, u.user_id, date_format(r.work_start, '%Y-%m-%d %H:%i:%s') as work_start, date_format(r.work_end, '%Y-%m-%d %H:%i:%s') as work_end , w.work_type_name from overtime o
        join User u, recruit r, work_type w
        where o.user_index = u.user_index
        and o.recruit_index = r.recruit_index
        and r.work_end >= now()
        group by overtime_index`);

        return res.status(restStatus.success).json(result);
    }catch(err) {
        return res.status(restStatus.fail).json(err);
    }finally {
        connection.release();
    }
})//오늘 임시 근로자 추출

router.get("/:user_id", async(req, res) => {
    const user_id = req.params.user_id;
    const connection = await pool.getConnection();
    try {
        
        const [result] = await connection.query(`select o.overtime_index, u.name, date_format(r.work_start, '%Y-%m-%d %H:%i') as work_start, date_format(r.work_end, '%Y-%m-%d %H:%i') as work_end, wt.work_type_name, 
        (CASE WHEN r.recruit_state = 0 THEN "대기중" WHEN r.recruit_state = 1 THEN "승인" WHEN r.recruit_state = 2 THEN "거절" END) as recruit_state, '추가근로' as type from overtime o
                join user u, recruit r, work_type wt
                where o.user_index = u.user_index
                and u.user_id = '${user_id}'
                and o.recruit_index = r.recruit_index
                and r.work_type_index = wt.work_type_index`);

        return res.status(restStatus.success).json(result);
    }catch (err) {
        return res.status(restStatus.fail).json(err);
    }finally {
        connection.release();
    }
})//확인

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
        return res.status(restStatus.success).json(results);
    }catch(err) {
        await connection.rollback();
        return res.status(restStatus.fail).json(err);
    }finally{
        connection.release();
    }
})

module.exports = router;