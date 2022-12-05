const express = require('express');
const router = express.Router();
const pool = require("../config/connectionPool");
const restStatus = require('../config/RestStatus');
const key = require("../config/encryptionKey");
const encryptionKey = key.key;
const fs = require('fs');
const xlsx = require('xlsx');

router.post("/:user_id", async(req,res) => {
    const user_id = req.params.user_id;
    const {year, month} = req.body;
    const connection = await pool.getConnection();
    try {
        const [result] = await connection.query(`select hour, wage, date_format(date, '%Y-%m-%d') as date from stats
        where year(date) = '${year}'
        and month(date) = '${month}'
        and user_id = '${user_id}'`)

        return res.status(restStatus.success).json(result);
    }catch(err) {
        return res.status(restStatus.fail).json(err);
    }finally {
        connection.release();
    }
})

router.get("/:year/:month/:user_id", async(req, res) => {
    const year = req.params.year;
    const month = req.params.month;
    const user_id = req.params.user_id;
    const connection = await pool.getConnection();
    try {
        const [result] = await connection.query(`select sum(hour) as hour, sum(wage) as wage, date_format(date, '%Y-%m') as date from stats
        where year(date) = '${year}'
        and month(date) = '${month}'
        and user_id = '${user_id}'`);

        return res.status(restStatus.success).json(result);
    }catch(err) {
        return res.status(restStatus.fail).json(err);
    }finally {
        connection.release();
    }
})

router.get("/excel", async(req, res) => {
    

    const connection = await pool.getConnection();
    
    
    try {
        const [result] = await connection.query(`SELECT s.user_id, u.name, concat(sum(s.hour), '시간') as hour, concat(format(sum(s.wage), 0), '원') as wage, date_format(s.date, '%Y년 %m월') as date, concat(' ') as '서명란' FROM stats s
        join user u
        where s.user_id = u.user_id
                group by user_id, month(date)
                 order by date`)
        
        const [result2] = await connection.query(`SELECT u.user_id as '학번', u.name as '이름', d.department_name as '학부(과)', b.bank_name as '은행',convert(aes_decrypt(unhex(u.account), '${encryptionKey}') using utf8) as '계좌번호',concat(sum(s.hour), '시간') as 근로시간, concat(format(sum(s.wage), 0), '원') as '장학금액', concat(' ') as '서명란' FROM stats s
        join user u, bank b, work_type w, department d
        where s.user_id = u.user_id
        and u.bank_index = b.bank_index
        and u.work_type_index = w.work_type_index
        and u.department_index = d.department_index
                group by s.user_id
                 order by u.name`)
        makeExcelByMonth(result, result2);
        
        return res.status(restStatus.success).json(result);
        
    }catch(err) {
        return res.status(restStatus.fail).json(err);
    }finally {
        connection.release();
    }
})


const makeExcelByMonth = (data, data2) => {
    const filePath = '달별 개인별.xlsx';
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    const EXCEL = xlsx.utils.book_new();

    const EXCEL_CONTENT1 = xlsx.utils.json_to_sheet(data);
    const EXCEL_CONTENT2 = xlsx.utils.json_to_sheet(data2);

    xlsx.utils.book_append_sheet(EXCEL, EXCEL_CONTENT1, `달별`);
    xlsx.utils.book_append_sheet(EXCEL, EXCEL_CONTENT2, `개인별`);

    xlsx.writeFile(EXCEL, filePath);
}


module.exports = router;