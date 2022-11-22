const express = require('express');
const router = express.Router();
const pool = require("../config/connectionPool");

router.get("/", async(req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.query(`select wo.work_type_name, w.change_date, w.hour_wage from wage w
        join work_type wo
        where w.work_type_index = wo.work_type_index`);

        return res.status(200).json(result);
    }catch(err) {
        return res.status(400).json(err);
    }finally {
        connection.release();
    }
})

module.exports = router;