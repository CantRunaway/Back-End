const express = require('express');
const router = express.Router();
const pool = require("../config/connectionPool");
const restStatus = require('../config/RestStatus');

router.get("/", async (req, res) => {
    const connection = await pool.getConnection();
    try {
        

        const [result] = await connection.query(`Select * from bank`);

        
        return res.status(restStatus.success).json(result);
    } catch(err) {
        
        return res.status(restStatus.fail).json(err);
        
    }
    finally {
        connection.release();
    }
});//완성


module.exports = router;