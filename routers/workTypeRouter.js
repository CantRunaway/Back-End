const express = require('express');
const router = express.Router();
const pool = require("../config/connectionPool");

router.get("/", async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.query(`Select * from work_type`);

        await connection.commit();
        return res.json(result);
    } catch(err) {
        return res.status(500).json(err);
        await connection.rollback();
    }
    finally {
        connection.release();
    }
});



router.post("/insert", async(req, res) => {
    const {work_type_name} = req.body;
    await connection.query(`Insert into work_type(work_type_name) values '${work_type_name}'`, (err, rows) => {
        if (err) throw err;
        console.log(rows);
        res.send(rows);
    })
});

router.post("/post", async(req, res) => {
    const {work_type_index} = req.body;
    await connection.query(`Delete from work_type Where work_type_index = '${work_type_index}'`, (err, rows) => {
        if (err) throw err;
        console.log(rows);
        res.send(rows);
    })
});

module.exports = router;