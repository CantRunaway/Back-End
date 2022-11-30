const express = require('express');
const router = express.Router();
const pool = require("../config/connectionPool");
const restStatus = require('../config/RestStatus');

router.get("/", async(req, res) => {
    const connection = await pool.getConnection();
    try {
        

        const [result] = await connection.query(`SELECT date_format(edit_start, '%Y-%m-%d') as edit_start, date_format(edit_end, '%Y-%m-%d') as edit_end FROM domang.edit_schedule_temporal`);

        return res.status(restStatus.success).json(result);
    }catch(err) {
        return res.status(restStatus.fail).json(err);
    }finally {
        connection.release();
    }
})//확인

router.post("/class", async(req, res) => {
    const {edit_start, edit_end} = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const result = await connection.query(`UPDATE edit_schedule_temporal SET edit_start = '${edit_start}', edit_end = '${edit_end}' where edit_schedule_temporal_index = 1`)
        await connection.commit();
        return res.status(restStatus.success).json(result);
    }catch(err) {
        await connection.rollback();
        return res.status(restStatus.fail).json(err);
    }finally{
        connection.release();
    }
})

router.post("/work", async(req, res) => {
    const {edit_start, edit_end} = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const result = await connection.query(`UPDATE edit_schedule_temporal SET edit_start = '${edit_start}', edit_end = '${edit_end}' where edit_schedule_temporal_index = 2`)
        await connection.commit();
        return res.status(restStatus.success).json(result);
    }catch(err) {
        await connection.rollback();
        return res.status(restStatus.fail).json(err);
    }finally{
        connection.release();
    }
})

module.exports = router;