const express = require('express');
const router = express.Router();
const pool = require("../config/connectionPool");
const status = require('../config/applyStatus');

router.post("/", async (req, res) => {
    const { absence_start, absence_end, user_index } = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const result = await connection.query(`Insert Into Absence(absence_state, absence_start, absence_end, user_index) values ('${status.waiting}', '${absence_start}', '${absence_end}', '${user_index}')`)

        await connection.commit();

        return res.json(result);
    } catch (err) {

        await connection.rollback();
        return res.status(400).json(err);
    } finally {
        connection.release();
    }

});

router.post("/response", async (req, res) => {
    const { absence_state, absence_index } = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const result = await connection.query(`Update Absence Set absence_state = '${absence_state}' WHERE absence_index = '${absence_index}'`);

        await connection.commit();

        return res.json(result);
    } catch (err) {

        await connection.rollback();
        return res.status(400).json(err);
    } finally {
        connection.release();
    }
});

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
        return res.status(200).json(result);
    } catch (err) {
        await connection.rollback();
        return res.status(400).json(err);
    } finally {
        connection.release();
    }

})

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
        return res.status(200).json(result);
    } catch (err) {
        await connection.rollback();
        return res.status(400).json(err);
    } finally {
        connection.release();
    }

})

router.get("/", async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [result] = await connection.query(`select a.absence_index, u.name, u.user_id, date_format(a.absence_start, '%Y-%m-%d %H:%i:%s') as work_start, date_format(a.absence_end, '%Y-%m-%d %H:%i:%s') as work_end, w.work_type_name from absence a
        join user u, work_type w
        where a.user_index = u.user_index
        and u.work_type_index = w.work_type_index
        and date_format(a.absence_start, '%Y-%m-%d') >= date_format(now(), '%Y-%m-%d')`);

        return res.status(200).json(result);
    } catch (err) {
        return res.status(400).json(err);
    } finally {
        connection.release();
    }
})//오늘 결근자 확인

module.exports = router;