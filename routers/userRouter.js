const express = require('express');
const router = express.Router();
const connection = require("../config/mysql");
const key = require("../config/encryptionKey");
const encryptionKey = key.key;

router.get("/userList", async (req, res) => {
    await connection.query(`Select user_id, name, grade, convert(aes_decrypt(unhex(phone), '${encryptionKey}') using utf8) as 'phone', convert(aes_decrypt(unhex(account), '${encryptionKey}') using utf8) as 'account', date_format(birth, '%Y-%m-%d') as birth, wt.work_type_name, b.bank_name from User u
    Join work_type wt, bank b
     Where u.work_type_index = wt.work_type_index
     And u.bank_index = b.bank_index
     And u.user_type = 2`, (error, rows) => {
        if (error) throw error;
        console.log("User info is: ",rows);
        res.send(rows);
    });
});

router.get("/userList/:name", async (req, res) => {
    const name = req.params.name;
    await connection.query(`Select user_id, name, grade, convert(aes_decrypt(unhex(phone), '${encryptionKey}') using utf8) as 'phone', convert(aes_decrypt(unhex(account), '${encryptionKey}') using utf8) as 'account', date_format(birth, '%Y-%m-%d') as birth, wt.work_type_name, b.bank_name from User u
    Join work_type wt, bank b
     Where u.work_type_index = wt.work_type_index
     And u.bank_index = b.bank_index
     And u.user_type = 2
     And u.name = '${name}'`, (error, rows) => {
        if (error) throw error;
        console.log("User Info Detail is: ", rows);
        res.send(rows);
     });
});

router.get("/deleteUser/:user_id", async (req, res) => {
    const user_id = req.params.user_id;
    await connection.query(`Delete From User Where user_id = '${user_id}'`, (err, rows) => {
        if (err) throw err;
        console.log("Delete User");
        res.send(rows);
    })
})

router.post("/register", async(req, res) => {
    console.log(req.body);
    const {account, bank_index, birth, grade, name, password, phone, user_id, work_type_index} = req.body;
    await connection.query(`Insert Into User(user_id, password, user_type, name, grade, phone, account, birth, registration_state, work_type_index, bank_index) values ('${user_id}', md5('${password}'), 2,'${name}','${grade}', hex(aes_encrypt('${phone}', '${encryptionKey}')),  hex(aes_encrypt('${account}', '${encryptionKey}')), '${birth}', 0, '${work_type_index}', '${bank_index}')`, (err, rows) => {
        if (err) throw err;
        console.log("User Insert Successed");
        res.send(rows);
    });
});

router.post("/login", async(req, res) => {
    const {user_id, password} = req.body;
    await connection.query(`Select exists (select user_index from User where user_id = '${user_id}' and password = md5('${password}')) as exist`, (err, rows) => {
        console.log(rows);
        if (rows[0].exist == 1) res.send("Login OK");
        else res.send("Login Fail");
    });
});


router.post("/update", async(req, res) => {
    const {user_id, password, name, grade, phone, account, birth, work_type_index, bank_index} = req.body;
    console.log(req.body);
    await connection.query(`Update User set 
    password = CASE WHEN md5('${password}') != password AND '${password}' IS NOT NULL THEN md5('${password}') ELSE password END, 
    name = CASE WHEN '${name}' != name AND '${name}' IS NOT NULL THEN '${name}' ELSE name END,
    grade = CASE WHEN '${grade}' != grade AND '${grade}' IS NOT NULL THEN '${grade}' ELSE grade END,
    phone = CASE WHEN '${phone}' != hex(aes_encrypt('${phone}', '${encryptionKey}')) AND '${phone}' IS NOT NULL THEN hex(aes_encrypt('${phone}', '${encryptionKey}')) ELSE phone END,
    account = CASE WHEN '${account}' != hex(aes_encrypt('${account}', '${encryptionKey}')) AND '${account}' IS NOT NULL THEN hex(aes_encrypt('${account}', '${encryptionKey}')) ELSE account END,
    birth = CASE WHEN '${birth}' != birth THEN '${birth}' ELSE birth END,
    work_type_index = CASE WHEN (Select work_type_index from work_type where work_type_name = '${work_type_name}') != work_type_index Then (Select work_type_index from work_type where work_type_name = '${work_type_name}') ELSE work_type_index END,
    bank_index = CASE WHEN (Select bank_index from bank where bank_name = '${bank_name}') != bank_index Then (Select bank_index from bank where bank_name = '${bank_name}') ELSE bank_index END,
    department_index = CASE WHEN (Select department_index from department where department_name = '${department_name}') != department_index Then (Select department_index from department where department_name = '${department_name}') ELSE department_index END
    Where user_id = 'admin' and password = '4752d51bd71f704beec34b798c76ca9e'`, (err, rows) => {
        console.log(rows);
        if (err) throw err;
        res.send(rows);
    });
});

module.exports = router;