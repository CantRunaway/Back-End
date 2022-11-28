const express = require('express');
const router = express.Router();
const pool = require("../config/connectionPool");
const status = require("../config/recruitStatus");

router.get("/", async(req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
    const [result] = await connection.query(`SELECT r.recruit_index, wt.work_type_name, r.recruit_state, date_format(r.work_start, '%Y-%m-%d %H:%i') as work_start , date_format(r.work_end, '%Y-%m-%d %H:%i') as work_end, r.recruit_worker, r.applyment_worker FROM Recruit r
    LEFT JOIN work_type wt
     ON r.work_type_index = wt.work_type_index
     WHERE r.recruit_state = '${status.waiting}'`);

     await connection.commit();
     return res.json(result);
    }catch(err) {
        await connection.rollback();
        return res.status(400).json(err);
    }finally {
        connection.release();
    }
})

router.post("/", async(req, res) => {
    const {work_type_index, work_start, work_end, recruit_worker, applyment_worker} = req.body;
    const connecttion = await pool.getConnection();
    try {
        await connecttion.beginTransaction();

        const result = await connection.query(`Insert Into Recruit(work_type_index, recruit_state, work_start, work_end, recruit_worker, applyment_worker) values ('${work_type_index}', '${status.waiting}','${work_start}', '${work_end}', '${recruit_worker}', '${applyment_worker}')`);

        await connecttion.commit();
        return res.json(result);
    }catch(err) {
        await connecttion.rollback();
        return res.status(400).json(err);
    }finally {
        connecttion.release();
    }
    
});

router.delete("/", async(req, res) => {
    const ids = req.body;
    let query = ``;

    if (ids.length == 1) {
        query = `Delete From Recruit Where recruit_index = '${ids[0]}'`
    }
    else if (ids.length > 1) {
        query = `Delete From Recruit Where recruit_index in (`;
        for (let i = 0; i < ids.length; i++) {
            query += `'${ids[i]}'`;
            if (i+1 != ids.length) {
                query += `, `;
            }
        }
        query += `)`;
    }
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const result = await connection.query(query);

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