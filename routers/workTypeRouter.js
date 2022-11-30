const express = require('express');
const router = express.Router();
const pool = require("../config/connectionPool");
const restStatus = require('../config/RestStatus');

router.get("/", async (req, res) => {
    const connection = await pool.getConnection();
    try {
        

        const [result] = await connection.query(`Select * from work_type`);

        
        return res.status(restStatus.success).json(result);
    } catch(err) {
        
        return res.status(restStatus.fail).json(err);
        
    }
    finally {
        connection.release();
    }
});



router.post("/insert", async(req, res) => {
    const {work_type_name} = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const result = await connection.query(`Insert into work_type(work_type_name) values '${work_type_name}'`);

        await connection.commit();
        return res.status(restStatus.success).json(result);
    }catch(err) {
        await connection.rollback();
        return res.status(restStatus.fail).json(err);
    }finally {
        connection.release();
    }
    
});

router.post("/post", async(req, res) => {
    const {work_type_index} = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const result = await connection.query(`Delete from work_type Where work_type_index = '${work_type_index}'`);

        await connection.commit();
        return res.status(restStatus.success).json(result);
    }catch(err) {
        await connection.rollback();
        return res.status(restStatus.fail).json(err);
    }finally {
        connection.release();
    }
});

module.exports = router;