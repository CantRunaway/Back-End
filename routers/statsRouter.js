const express = require('express');
const router = express.Router();
const pool = require("../config/connectionPool");
const restStatus = require('../config/RestStatus');
const key = require("../config/encryptionKey");
const encryptionKey = key.key;

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
        const [result] = await connection.query(`select sum(hour) as hour, sum(wage) as wage, date_format(date, '%Y-%m') as date from stats
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

router.get("/excel/:month", async(req, res) => {
    const connection = await pool.getConnection();    
    const month = req.params.month;
    try {
        const [result] = await connection.query(`SELECT s.user_id, u.name, concat(sum(s.hour), '시간') as hour, concat(format(sum(s.wage), 0), '원') as wage, date_format(s.date, '%Y년 %m월') as date, concat(' ') as '서명란' FROM stats s
        join user u
        where s.user_id = u.user_id
        and month(date) = '${month}'
                group by user_id, month(date)
                 order by date`)
        
        return res.status(restStatus.success).json(result);
        
    }catch(err) {
        return res.status(restStatus.fail).json(err);
    }finally {
        connection.release();
    }
})

router.get("/excel/:user_id/:month", async(req, res) => {
    const connection = await pool.getConnection();    
    const month = req.params.month;
    const user_id = req.params.user_id;
    try {
        const [result] = await connection.query(`SELECT s.user_id, u.name, s.hour as hour, s.wage as wage, date_format(s.date, '%Y년 %m월 %d일') as date, concat(' ') as '서명란' FROM stats s
        join user u
        where s.user_id = u.user_id
        and month(date) = '${month}'
        and s.user_id = '${user_id}'
                 order by date`)
        
        return res.status(restStatus.success).json(result);
        
    }catch(err) {
        return res.status(restStatus.fail).json(err);
    }finally {
        connection.release();
    }
})


module.exports = router;