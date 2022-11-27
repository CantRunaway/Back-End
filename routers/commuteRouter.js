const express = require('express');
const router = express.Router();
const pool = require("../config/connectionPool");
const status = require("../config/commuteTypeStatus");

router.get("/:user_id", async(req, res) => {
    const user_id = req.params.user_id;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.query(`select c.commute_time from commute_log c join User u where c.commute_time <= date_format(now(), '%Y-%m-%d %H:%i:%s') and u.user_id = '${user_id}' and u.work_state = '${status.go_to_work}' order by c.commute_time DESC limit 1`)

        return res.status(200).json(result);
    }catch(err) {
        return res.status(400).json(err);
    }finally {
        connection.release();
    }
})

module.exports = router;