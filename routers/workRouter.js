const express = require('express');
const router = express.Router();
const pool = require("../config/connectionPool");

const getScheduleIndex = (time) => {
    const times = time.split(":");
    const index = parseInt(times[0]) * 2;

    return parseInt(times[1]) == 30 ? index + 2 : index + 1;
};

router.post("/", async(req, res) => {
    const {work_day, user_index, start_time, end_time} = req.body;
    const start_index = getScheduleIndex(start_time);
    const end_index = getScheduleIndex(end_time)-1;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        let resultList = [];

        for (let i = start_index; i <= end_index; i++) {
            resultList.push(`${i}`);
        }
        let resultList2 = resultList;
        console.log(resultList);
        
        const result = await connection.query(`INSERT INTO Work (work_day, user_index, schedule_index)
        SELECT * FROM (SELECT '${work_day}' as enrollment_day, '${user_index}' as user_index, ? as schedule_index) AS en
            WHERE NOT EXISTS (
                SELECT * FROM Enrollment
                WHERE enrollment_day = '${work_day}'
                AND user_index = '${user_index}'
                AND schedule_index exists ?)`, [[resultList], [resultList]]);//매핑 확인

        await connection.commit();
        return res.status(200).json(result);
    }catch(err) {
        await connection.rollback();
        return res.status(400).json(err);
    }finally{
        connection.release();
    }
})

module.exports = router;