const express = require('express');
const router = express.Router();
const pool = require("../config/connectionPool");
const restStatus = require('../config/RestStatus');

router.post("/:user_id", async(req,res) => {
    const user_id = req.params.user_id;
    const {year, month} = req.body;
    const connection = await pool.getConnection();
    try {
        const [result] = await connection.query(`select hour, wage, date_format(date, '%Y-%m-%d') as date from stats
        where year(date) = '${year}'
        and month(date) = '${month}'
        and user_id = '${user_id}'`)

        return res.status(restStatus.success).json(result);
    }catch(err) {
        return res.status(restStatus.fail).json(err);
    }finally {
        connection.release();
    }
})

router.get("/:year/:month/:user_id", async(req, res) => {
    const year = req.params.year;
    const month = req.params.month;
    const user_id = req.params.user_id;
    const connection = await pool.getConnection();
    try {
        const [result] = await connection.query(`select sum(hour) as hour, sum(wage) as wage , date_format(date, '%Y-%m-%d') as date from stats
        where year(date) = '${year}'
        and month(date) = '${month}'
        and user_id = '${user_id}'`);

        return res.status(restStatus.success).json(result);
    }catch(err) {
        return res.status(restStatus.fail).json(err);
    }finally {
        connection.release();
    }
})

module.exports = router;