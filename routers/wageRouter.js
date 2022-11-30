const express = require('express');
const router = express.Router();
const pool = require("../config/connectionPool");
const restStatus = require('../config/RestStatus');

router.get("/", async(req, res) => {
    const connection = await pool.getConnection();
    try {
        

        const [result] = await connection.query(`select w.wage_index, wo.work_type_index, wo.work_type_name, date_format(w.change_date, '%Y-%m-%d') as change_date, w.hour_wage from wage w
        join work_type wo
        where w.work_type_index = wo.work_type_index
        order by change_date desc`);

        return res.status(restStatus.success).json(result);
    }catch(err) {
        return res.status(restStatus.fail).json(err);
    }finally {
        connection.release();
    }
})//완료

router.post("/", async(req, res) => {
    const {work_type_name, change_date, wage} = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const result = await connection.query(`call Make_work_type_wage('${work_type_name}', '${change_date}', '${wage}')`)

        await connection.commit();
        return res.status(restStatus.success).json(result);
    }catch(err) {
        await connection.rollback();
        return res.status(restStatus.fail).json(err);
    }finally {
        connection.release();
    }
})

router.post("/delete", async(req, res) => {
    const body = req.body;
    let query = ``;

    if(body.length == 1) {
        query = `Delete From Wage Where wage_index = '${body[0]}'`;
    }
    else if (body.length > 1) {
        query = `Delete From Wage Where wage_index in (`;
        for (let i = 0; i < body.length; i++) {
            query += `'${body[i]}'`;
            if (i+1 != body.length) {
                query += `,`;
            }
        }
        query += `)`;
    }
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const result = await connection.query(query);

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