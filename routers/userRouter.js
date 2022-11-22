const express = require('express');
const router = express.Router();
const pool = require("../config/connectionPool");
const key = require("../config/encryptionKey");
const status = require('../config/applyStatus');
const userType = require('../config/userTypeStatus');
const commuteType = require('../config/commuteTypeStatus');
const encryptionKey = key.key;

router.get("/userList", async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [result] = await connection.query(`Select user_id, name, grade, convert(aes_decrypt(unhex(phone), '${encryptionKey}') using utf8) as 'phone', convert(aes_decrypt(unhex(account), '${encryptionKey}') using utf8) as 'account', date_format(birth, '%Y-%m-%d') as birth, wt.work_type_name, b.bank_name , d.department_name as major from User u
        Join work_type wt, bank b, department d
        Where u.work_type_index = wt.work_type_index
        And u.bank_index = b.bank_index
        And u.user_type = '${userType.worker}'
        And u.department_index = d.department_index
        `);
        await connection.commit();
        return res.json(result);
    }catch(err) {
        await connection.rollback();
        return res.status(400).json(err);
    }finally {
        connection.release();
    }
});


router.get("/userList/:name", async (req, res) => {
    const name = req.params.name;
    try {
        await connection.beginTransaction();
        const [result] = await connection.query(`Select user_id, name, grade, convert(aes_decrypt(unhex(phone), '${encryptionKey}') using utf8) as 'phone', convert(aes_decrypt(unhex(account), '${encryptionKey}') using utf8) as 'account', date_format(birth, '%Y-%m-%d') as birth, wt.work_type_name, b.bank_name from User u
        Join work_type wt, bank b
         Where u.work_type_index = wt.work_type_index
         And u.bank_index = b.bank_index
         And u.user_type = '${userType.worker}'
         And u.name = '${name}'`);
        await connection.commit();
        return res.json(result);
    }catch(err) {
        await connection.rollback();
        return res.status(400).json(err);
    }finally {
        connection.release();
    }
});

router.get("/deleteUser/:user_id", async (req, res) => {
    const user_id = req.params.user_id;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const result = await connection.query(`Delete From User Where user_id = '${user_id}'`);

        await connection.commit();
        return res.json(result);
    }catch(err) {
        await connection.rollback();
        return res.status(400).json(err);
    }finally {
        connection.release();
    }
    
});

router.post("/register", async(req, res) => {
    const {account, bank_index, birth, grade, name, password, phone, user_id, work_type_index, department_index} = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const result = await connection.query(`Insert Into User(user_id, password, user_type, name, grade, phone, account, birth, registration_state, work_type_index, bank_index, department_index, work_state) values ('${user_id}', md5('${password}'), '${userType.worker}','${name}','${grade}', hex(aes_encrypt('${phone}', '${encryptionKey}')),  hex(aes_encrypt('${account}', '${encryptionKey}')), '${birth}', '${status.waiting}', '${work_type_index}', '${bank_index}', '${department_index}', '${commuteType.leave_work}')`);

        await connection.commit();
        return res.json(result);
    }catch(err) {
        await connection.rollback();
        return res.status(400).json(err);
    }finally {
        connection.release();
    }
    
});

router.post("/register/response", async(req, res) => {
    const {status, user_id} = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const result = await connection.query(`Update User set registration_state = '${status}' Where user_id = '${user_id}'`);

        await connection.commit();
        return res.json(result);
    }catch(err) {
        await connection.rollback();
        return res.status(400).json(err);
    } finally {
        connection.release();
    }
    
})

router.post("/login", async(req, res) => {
    const {user_id, password} = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.query(`Select exists (select user_index from User where user_id = '${user_id}' and password = md5('${password}')) as exist`);

        await connection.commit();
        
        return result[0].exist == 1 ? res.json(true) : res.json(false);
    }catch(err) {
        await connection.rollback();
        return res.status(400).json(err);
    }finally {
        connection.release();
    }
    
});


router.post("/update", async(req, res) => {
    const {user_id, password, name, grade, phone, account, birth, work_type_index, bank_index, department_index} = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const result = await connection.query(`Update User set 
        password = CASE WHEN md5('${password}') != password AND '${password}' IS NOT NULL THEN md5('${password}') ELSE password END, 
        name = CASE WHEN '${name}' != name AND '${name}' IS NOT NULL THEN '${name}' ELSE name END,
        grade = CASE WHEN '${grade}' != grade AND '${grade}' IS NOT NULL THEN '${grade}' ELSE grade END,
        phone = CASE WHEN '${phone}' != hex(aes_encrypt('${phone}', '${encryptionKey}')) AND '${phone}' IS NOT NULL THEN hex(aes_encrypt('${phone}', '${encryptionKey}')) ELSE phone END,
        account = CASE WHEN '${account}' != hex(aes_encrypt('${account}', '${encryptionKey}')) AND '${account}' IS NOT NULL THEN hex(aes_encrypt('${account}', '${encryptionKey}')) ELSE account END,
        birth = CASE WHEN '${birth}' != birth THEN '${birth}' ELSE birth END,
        work_type_index = CASE WHEN '${work_type_index}' != work_type_index Then '${work_type_index}' ELSE work_type_index END,
        bank_index = CASE WHEN '${bank_index}' != bank_index Then '${bank_index}' ELSE bank_index END,
        department_index = CASE WHEN '${department_index}' != department_index Then '${department_index}' ELSE department_index END
        Where user_id = '${user_id}'`);

        await connection.commit();
        return res.json(result);
    }catch(err) {
        await connection.rollback();
        return res.status(400).json(err);
    }finally {
        connection.release();
    }

    
});//name으로 된거 전부 index로 변경

module.exports = router;