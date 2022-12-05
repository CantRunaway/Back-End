const express = require('express');
const router = express.Router();
const pool = require("../config/connectionPool");
const key = require("../config/encryptionKey");
const status = require('../config/applyStatus');
const userType = require('../config/userTypeStatus');
const commuteType = require('../config/commuteTypeStatus');
const encryptionKey = key.key;
const restStatus = require('../config/RestStatus');

router.get("/userList", async (req, res) => {
    const connection = await pool.getConnection();
    try {
        
        const [result] = await connection.query(`Select user_id, name, grade, convert(aes_decrypt(unhex(phone), '${encryptionKey}') using utf8) as 'phone', convert(aes_decrypt(unhex(account), '${encryptionKey}') using utf8) as 'account', date_format(birth, '%Y-%m-%d') as birth, wt.work_type_name, b.bank_name , d.department_name as major from User u
        Join work_type wt, bank b, department d
        Where u.work_type_index = wt.work_type_index
        And u.bank_index = b.bank_index
        And u.user_type = '${userType.worker}'
        And u.registration_state = '${status.approval}'
        And u.department_index = d.department_index
        `);
        
        return res.status(restStatus.success).json(result);
    } catch (err) {
        
        return res.status(restStatus.fail).json(err);
    } finally {
        connection.release();
    }
});//완료

router.get("/userList/:user_id", async (req, res) => {
    const user_id = req.params.user_id;
    const connection = await pool.getConnection();
    try {
        
        const [result] = await connection.query(`Select user_id, convert(aes_decrypt(unhex(password), '${encryptionKey}') using utf8) as password, name, grade, convert(aes_decrypt(unhex(phone), '${encryptionKey}') using utf8) as 'phone', convert(aes_decrypt(unhex(account), '${encryptionKey}') using utf8) as 'account', date_format(birth, '%Y-%m-%d') as birth, wt.work_type_name, b.bank_name , d.department_name as major from User u
        Join work_type wt, bank b, department d
        Where u.work_type_index = wt.work_type_index
        And u.bank_index = b.bank_index
        And u.user_type = '${userType.worker}'
        And u.department_index = d.department_index
        And u.registration_state = '${status.approval}'
        And u.user_id = '${user_id}'
        `);
        
        return res.status(restStatus.success).json(result);
    } catch (err) {
        
        return res.status(restStatus.fail).json(err);
    } finally {
        connection.release();
    }
});//완료

router.get("/workList", async (req, res) => {
    const connection = await pool.getConnection();
    try {
        
        const [result] = await connection.query(`select u.user_id, u.name, w.work_type_name from User u
        Join work_type w
        Where u.work_type_index = w.work_type_index
        And u.registration_state = '${status.approval}'
        Order by u.user_id`);

        
        return res.status(restStatus.success).json(result);

    }
    catch (err) {
        
        return res.status(restStatus.fail).json(err);
    } finally {
        connection.release();
    }
});//완료

router.get("/userLists/wating", async (req, res) => {
    const connection = await pool.getConnection();
    try {
        

        const [result] = await connection.query(`select user_index, user_id, name, grade, convert(aes_decrypt(unhex(phone), '${encryptionKey}') using utf8) as 'phone', date_format(birth, '%Y-%m-%d') as birth, wt.work_type_name, d.department_name as major from User u
        Join work_type wt,  department d
        Where u.work_type_index = wt.work_type_index
        And u.department_index = d.department_index
        And u.registration_state = '${status.waiting}'`)


        
        return res.status(restStatus.success).json(result);
    } catch (err) {
        
        return res.status(restStatus.fail).json(err);
    } finally {
        connection.release();
    }
});//완료


router.get("/userList/:name", async (req, res) => {
    const name = req.params.name;
    try {
        
        const [result] = await connection.query(`Select user_id, name, grade, convert(aes_decrypt(unhex(phone), '${encryptionKey}') using utf8) as 'phone', convert(aes_decrypt(unhex(account), '${encryptionKey}') using utf8) as 'account', date_format(birth, '%Y-%m-%d') as birth, wt.work_type_name, b.bank_name from User u
        Join work_type wt, bank b
         Where u.work_type_index = wt.work_type_index
         And u.bank_index = b.bank_index
         And u.user_type = '${userType.worker}'
         And u.name = '${name}'`);
        
        return res.status(restStatus.success).json(result);
    } catch (err) {
        
        return res.status(restStatus.fail).json(err);
    } finally {
        connection.release();
    }
});//완료

router.post("/deleteUser", async (req, res) => {
    const ids = req.body;
    let query = ``;

    if (ids.length == 1) {
        query = `Delete From User Where user_id = '${ids[0]}'`
    }
    else if (ids.length > 1) {
        query = `Delete From User Where user_id in (`;
        for (let i = 0; i < ids.length; i++) {
            query += `'${ids[i]}'`;
            if (i + 1 != ids.length) {
                query += `, `;
            }
        }
        query += `)`;
    }
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const result = await connection.query(query);

        await connection.commit();
        return res.status(restStatus.success).json(result);
    } catch (err) {
        await connection.rollback();
        return res.status(restStatus.fail).json(err);
    } finally {
        connection.release();
    }
})

router.post("/register", async (req, res) => {
    const { account, bank_index, birth, grade, name, password, phone, user_id, work_type_index, department_index } = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const result = await connection.query(`Insert Into User(user_id, password, user_type, name, grade, phone, account, birth, registration_state, work_type_index, bank_index, department_index, work_state) values ('${user_id}', md5('${password}'), '${userType.worker}','${name}','${grade}', hex(aes_encrypt('${phone}', '${encryptionKey}')),  hex(aes_encrypt('${account}', '${encryptionKey}')), '${birth}', '${status.waiting}', '${work_type_index}', '${bank_index}', '${department_index}', '${commuteType.leave_work}')`);

        await connection.commit();
        return res.status(restStatus.success).json(result);
    } catch (err) {
        await connection.rollback();
        return res.status(restStatus.fail).json(err);
    } finally {
        connection.release();
    }

});

router.post("/register/response/admit", async (req, res) => {
    user_ids = req.body;
    let query = ``;

    query = `UPDATE User u JOIN (SELECT '${user_ids[0]}' as id, '${status.approval}' as state `;
    for (let i = 1; i < user_ids.length; i++) {
        query += (`UNION ALL SELECT '${user_ids[i]}', '${status.approval}'`)
    }
    query += (`) vals ON u.user_id = vals.id SET registration_state = state`)

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const result = await connection.query(query);

        await connection.commit();
        return res.status(restStatus.success).json(result);
    } catch (err) {
        await connection.rollback();
        return res.status(restStatus.fail).json(err);
    } finally {
        connection.release();
    }

})

router.post("/register/response/refuse", async (req, res) => {
    user_ids = req.body;
    let query = ``;

    query = `UPDATE User u JOIN (SELECT '${user_ids[0]}' as id, '${status.refuse}' as state `;
    for (let i = 1; i < user_ids.length; i++) {
        query += (`UNION ALL SELECT '${user_ids[i]}', '${status.refuse}'`)
    }
    query += (`) vals ON u.user_id = vals.id SET registration_state = state`)
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const result = await connection.query(query);

        await connection.commit();
        return res.status(restStatus.success).json(result);
    } catch (err) {
        await connection.rollback();
        return res.status(restStatus.fail).json(err);
    } finally {
        connection.release();
    }

})

router.post("/login", async (req, res) => {
    const { user_id, password } = req.body;
    const connection = await pool.getConnection();
    try {
        

        const [result] = await connection.query(`Select exists (select user_index from User where user_id = '${user_id}' and password = md5('${password}') and registration_state = 1) as exist`);

        

        return result[0].exist == 1 ? res.status(restStatus.success).json(true) : res.status(restStatus.success).json(false);
    } catch (err) {
        
        return res.status(restStatus.fail).json(err);
    } finally {
        connection.release();
    }

});

router.get("/:user_id", async(req, res) => {
    const user_id = req.params.user_id;
    const connection = await pool.getConnection();
    try {
        const [result] = await connection.query(`select user_index from user where user_id = '${user_id}' limit 1`);

        return res.status(restStatus.success).json(result);
    }catch(err) {
        return res.status(restStatus.fail).json(err);
    }finally {
        connection.release();
    }
})

router.post("/update", async (req, res) => {
    const { user_id, password, name, grade, phone, account, birth, work_type_name, bank_name, major } = req.body;
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
        work_type_index = CASE WHEN '${work_type_name}' != work_type_index Then '${work_type_name}' ELSE work_type_index END,
        bank_index = CASE WHEN '${bank_name}' != bank_index Then '${bank_name}' ELSE bank_index END,
        department_index = CASE WHEN '${major}' != department_index Then '${major}' ELSE department_index END
        Where user_id = '${user_id}'`);

        await connection.commit();
        return res.status(restStatus.success).json(result);
    } catch (err) {
        await connection.rollback();
        return res.status(restStatus.fail).json(err);
    } finally {
        connection.release();
    }


});

router.get("/commute/:user_id", async (req, res) => {
    const user_id = req.params.user_id;
    const connection = await pool.getConnection();
    try {
        

        const [result] = await connection.query(`select work_state from User where user_id = '${user_id}'`);

        
        return res.status(restStatus.success).json(result);
    } catch (err) {
        
        return res.status(restStatus.fail).json(err);
    } finally {
        connection.release();
    }
});//완료

module.exports = router;