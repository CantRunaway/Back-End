const express = require('express');
const router = express.Router();
const pool = require("../config/connectionPool");

router.get("/", async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.query(`Select * from schedule`);

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