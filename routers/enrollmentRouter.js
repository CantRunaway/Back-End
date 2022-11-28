const express = require('express');
const router = express.Router();
const pool = require("../config/connectionPool");

const getScheduleIndex = (time) => {
    const times = time.split(":");
    const index = parseInt(times[0]) * 2;

    return parseInt(times[1]) == 30 ? index + 2 : index + 1;
};

router.post("/", async(req, res) => {
    const {enrollment_day, start_time, end_time, user_index} = req.body;
    const connection = await pool.getConnection();
    const start_index = getScheduleIndex(start_time);
    const end_index = getScheduleIndex(end_time)-1;
    try {
        await connection.beginTransaction();
        let resultList = [];

        for (let i = start_index; i <= end_index; i++) {
            resultList.push([`${enrollment_day}`, `${user_index}`, `${i}`]);
        }

        const result = await connection.query(`Insert into enrollment(enrollment_day, user_index, Schedule_index) values ?`, [resultList]);

        await connection.commit();
        return res.status(200).json(result);
    }catch(err) {
        await connection.rollback();
        return res.status(400).json(err);
    }finally {
        connection.release();
    }
});

router.get("/", async(req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.query(`SELECT us.name, en.enrollment_day, sc.start_time, sc.end_time FROM Enrollment en
            JOIN User us, Schedule sc
            WHERE en.user_index = us.user_index
            AND en.schedule_index = sc.schedule_index`);

        await connection.commit();
        return res.status(200).json(result);
    }catch(err) {
        await connection.rollback();
        return res.status(400).json(err);
    }finally {
        connection.release();
    }
});

router.get("/:user_id", async(req, res) => {
    const user_id = req.params.user_id;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.query(`select 'class' as type, concat(date_format(s.start_time, '%H:%i'), en.enrollment_day) as id, en.enrollment_day as day, date_format(s.start_time, '%H:%i') as time from enrollment en
        Join schedule s, work_type w, user u
        where en.user_index = u.user_index
        and en.Schedule_index = s.schedule_index
        and u.work_type_index = w.work_type_index
        and u.user_id = '${user_id}' order by start_time`);
        
        await connection.commit();
        return res.status(200).json(result);
    }catch(err) {
        await connection.rollback();
        return res.status(400).json(err);
    }finally {
        connection.release();
    }
})

router.post("/postEnroll/:user_id", async(req, res) => {
    const user_id = req.params.user_id;
    const data = req.body;
    const connection = await pool.getConnection();
    let bodies = [];
    try {
        
        await connection.beginTransaction();
        const [result] = await connection.query(`select user_index from user where user_id = '${user_id}'`);
        const user_index = result[0].user_index;
        for (let i = 0; i < data.length; i++) {
            bodies.push([`${data[i].day}`, `${user_index}`, `${getScheduleIndex(data[i].time)}`])
        }
        await connection.query(`delete from enrollment where user_index = '${user_index}'`);
        const results = await connection.query(`insert into enrollment(enrollment_day, user_index, schedule_index) values ?`, [bodies]);


        await connection.commit();
        return res.status(200).json(results);
    }catch(err) {
        await connection.rollback();
        return res.status(400).json(err);
    }finally {
        connection.release();
    }
})

module.exports = router;