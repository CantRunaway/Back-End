const express = require('express');
const router = express.Router();
const pool = require("../config/connectionPool");
const status = require("../config/commuteTypeStatus");
const restStatus = require('../config/RestStatus');

router.get("/:user_id", async(req, res) => {
    const user_id = req.params.user_id;
    const connection = await pool.getConnection();
    try {
        

        const [result] = await connection.query(`select c.commute_time from commute_log c join User u where c.commute_time <= date_format(now(), '%Y-%m-%d %H:%i:%s') and u.user_id = '${user_id}' and u.work_state = '${status.go_to_work}' order by c.commute_time DESC limit 1`)

        return res.status(restStatus.success).json(result);
    }catch(err) {
        return res.status(restStatus.fail).json(err);
    }finally {
        connection.release();
    }
})//내가 출근 상태일때 퇴근으로 바꾸면서 출근 찍은 시간하고 비교하기 위한 선행 쿼리

module.exports = router;