const express = require('express');
const router = express.Router();
const pool = require("../config/connectionPool");
const status = require("../config/applyStatus");
const userType = require("../config/userTypeStatus");

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
        const [result] = await connection.query(`select wo.work_index, u.name, u.user_id, min(s.start_time) as start_time, max(s.end_time) as end_time , w.work_type_name, (IF(work_state = 1, "출근", "퇴근")) as work_state from work wo
        Join schedule s, work_type w, user u
        where wo.user_index = u.user_index
        and wo.Schedule_index = s.schedule_index
        and u.work_type_index = w.work_type_index
        group by user_id`);

        return res.status(200).json(result);
    }catch(err) {
        return res.status(400).json(err);
    }finally{
        connection.release();
    }
})

router.post("/postWork/:user_id", async(req, res) => {
    const user_id = req.params.user_id;
    const data = req.body;
    
    const connection = await pool.getConnection();
    try {
        
        await connection.beginTransaction();
        const [result] = await connection.query(`select user_index from user where user_id = '${user_id}'`);
        const user_index = result[0].user_index;
        await connection.query(`delete from work where user_index = '${user_index}'`);
        const results = [];
        for (let i = 0; i < data.length; i++) {
            const re = await connection.query(`call Compare_schedule( ${user_index}, '${data[i].day}', ${getScheduleIndex(data[i].time)})`);
            results.push(re);
        }
        
        await connection.commit();
        return res.status(200).json(results);
    }catch(err) {
        await connection.rollback();
        return res.status(400).json(err);
    }finally {
        connection.release();
    }
})

router.get("/:user_id", async(req, res) => {
    const user_id = req.params.user_id;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [result] = await connection.query(`select 'work' as type, concat(date_format(s.start_time, '%H:%i'), wo.work_day) as id, wo.work_day as day, date_format(s.start_time, '%H:%i') as time from work wo
        Join schedule s, work_type w, user u
        where wo.user_index = u.user_index
        and wo.Schedule_index = s.schedule_index
        and u.work_type_index = w.work_type_index
        and u.user_id = '${user_id}' order by start_time`);

        return res.status(200).json(result);
    }catch(err) {
        return res.status(400).json(err);
    }finally{
        connection.release();
    }
})

router.get("/worker", async(req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [result] = await connection.query(`select name from user where registration_state = '${status.approval}' and user_type = '${userType.worker}'`);

        return res.status(200).json(result);
    }catch(err) {
        return res.status(400).json(err);
    }finally {
        connection.release();
    }
})
module.exports = router;