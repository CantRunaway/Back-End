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
            resultList.push([`${work_day}`, `${user_index}`, `${i}`]);
        }
        
        const result = await connection.query(`INSERT INTO Work (work_day, user_index, schedule_index) values ?`, [resultList]);//매핑 확인

        await connection.commit();
        return res.status(200).json(result);
    }catch(err) {
        await connection.rollback();
        return res.status(400).json(err);
    }finally{
        connection.release();
    }
})

router.get("/", async(req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [result] = await connection.query(`select wo.work_index, u.name, u.user_id, s.start_time, s.end_time, w.work_type_name from work wo
        Join schedule s, work_type w, user u
        where wo.user_index = u.user_index
        and wo.Schedule_index = s.schedule_index
        and u.work_type_index = w.work_type_index`);

        return res.status(200).json(result);
    }catch(err) {
        return res.status(400).json(err);
    }finally{
        connection.release();
    }
})

module.exports = router;