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


module.exports = router;