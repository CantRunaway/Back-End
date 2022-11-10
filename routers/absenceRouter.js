const express = require('express');
const router = express.Router();
const pool = require("../config/connectionPool");
const status = require('../config/applyStatus');

router.post("/", async(req, res) => {
    const {absence_start, absence_end, user_index} = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const result = await connection.query(`Insert Into Absence(absence_state, absence_start, absence_end, user_index) values ('${status.waiting}', '${absence_start}', '${absence_end}', '${user_index}')`)
        
        await connection.commit();
        
        return res.json(result);
    } catch(err) {
        
        await connection.rollback();
        return res.status(400).json(err);
    }finally {
        connection.release();
    }
    
});

router.post("/response", async(req, res) => {
    const {absence_state, absence_index} = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const result = await connection.query(`Update Absence Set absence_state = '${absence_state}' WHERE absence_index = '${absence_index}'`);

        await connection.commit();

        return res.json(result);
    } catch(err) {

        await connection.rollback();
        return res.status(400).json(err);
    } finally {
        connection.release();
    }
});

module.exports = router;