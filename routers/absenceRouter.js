const express = require('express');
const router = express.Router();
const pool = require("../config/connectionPool");
const status = require('../config/applyStatus');
const restStatus = require('../config/RestStatus');

router.post("/:user_id", async (req, res) => {
    const user_id = req.params.user_id;
    const { start_time, end_time} = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [index] = await connection.query(`select user_index from user where user_id = '${user_id}'`);
        const user_index = index[0].user_index;
        const result = await connection.query(`Insert Into Absence(absence_state, absence_start, absence_end, user_index) values ('${status.waiting}', '${start_time}', '${end_time}', '${user_index}')`)

        await connection.commit();

        return res.status(restStatus.success).json(result);
    } catch (err) {

        await connection.rollback();
        return res.status(restStatus.fail).json(err);
    } finally {
        connection.release();
    }
});//완성

router.post("/createList/:user_id", async(req, res) => {
    const user_id = req.params.user_id;
    const ids = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [index] = await connection.query(`select user_index from user where user_id = '${user_id}'`);
        const user_index = index[0].user_index;
        let arr = [];
        for (let i = 0; i < ids.length; i++) {
            arr.push([`${status.waiting}`, `${arr[i].start_time}`, `${arr[i].end_time}`, `${user_index}`]);
        }

        const result = await connection.query(`Insert Into Absence(absence_state, absence_start, absence_end, user_index) values ?`, [arr]);

        await connection.commit();
        return res.status(restStatus.success).json(result);

    }catch(err) {
        await connection.rollback();
        return res.status(restStatus.fail).json(err);
    }finally {
        connection.release();
    }
})

router.get("/:user_id", async(req, res) => {
    const user_id = req.params.user_id;
    const connection = await pool.getConnection();
    try {
        

        const [result] = await connection.query(`select a.absence_index, u.name, date_format(a.absence_start, '%Y-%m-%d %H:%i') as work_start, date_format(a.absence_end, '%Y-%m-%d %H:%i') as work_end, wt.work_type_name, a.absence_state, '결근' as type from absence a
        join user u, work_type wt
        where u.user_id = '${user_id}'
        and a.user_index = u.user_index
        and wt.work_type_index = u.work_type_index`);

        return res.status(restStatus.success).json(result);
    }catch(err) {
        return res.status(restStatus.fail).json(err);
    }finally{
        connection.release();
    }
})//완성

router.post("/response", async (req, res) => {
    const { absence_state, absence_index } = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const result = await connection.query(`Update Absence Set absence_state = '${absence_state}' WHERE absence_index = '${absence_index}'`);

        await connection.commit();

        return res.status(restStatus.success).json(result);
    } catch (err) {

        await connection.rollback();
        return res.status(restStatus.fail).json(err);
    } finally {
        connection.release();
    }
});//완성

router.post("/admit", async (req, res) => {
    ids = req.body;
    let query = ``;

    query = `update absence a join (select '${ids[0]}' as id, '${status.approval}' as state `;
    for (let i = 1; i < ids.length; i++) {
        query += (`union all select '${ids[i]}', '${status.approval}'`)
    }
    query += (`) vals on a.absence_index = vals.id set absence_state = state`)

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

})//완성

router.post("/refuse", async (req, res) => {
    ids = req.body;
    let query = ``;

    query = `update absence a join (select '${ids[0]}' as id, '${status.refuse}' as state `;
    for (let i = 1; i < ids.length; i++) {
        query += (`union all select '${ids[i]}', '${status.refuse}'`)
    }
    query += (`) vals on a.absence_index = vals.id set absence_state = state`)

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

})//완성

router.get("/", async (req, res) => {
    const connection = await pool.getConnection();
    try {
        
        const [result] = await connection.query(`select a.absence_index, u.name, u.user_id, date_format(a.absence_start, '%Y-%m-%d %H:%i:%s') as work_start, date_format(a.absence_end, '%Y-%m-%d %H:%i:%s') as work_end, w.work_type_name from absence a
        join user u, work_type w
        where a.user_index = u.user_index
        and u.work_type_index = w.work_type_index
        and a.absence_end >= now()`);

        return res.status(restStatus.success).json(result);
    } catch (err) {
        return res.status(restStatus.fail).json(err);
    } finally {
        connection.release();
    }
})//오늘 이후의 결근 자 확인

module.exports = router;