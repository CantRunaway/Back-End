const express = require('express');
const router = express.Router();
const pool = require("../config/connectionPool");

router.get("/", async(req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.query(`SELECT date_format(edit_start, '%Y-%m-%d') as edit_start, date_format(edit_end, '%Y-%m-%d') as edit_end FROM domang.edit_schedule_temporal`);

        return res.status(200).json(result);
    }catch(err) {
        return res.status(400).json(err);
    }finally {
        connection.release();
    }
})

module.exports = router;