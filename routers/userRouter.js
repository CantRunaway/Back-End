const express = require('express');
const router = express.Router();
const connection = require("../config/mysql");
const key = require("../config/encryptionKey");
const encryptionKey = key.key;

router.get("/", async (req, res) => {
    await connection.query("Select * from User", (error, rows) => {
        if (error) throw error;
        console.log("User info is: ",rows);
        res.send(rows);
    });
    
});

router.post("/register", async(req, res) => {
    const {user_id, password, name, grade, phone, account, birth, work_type_index, bank_index} = req.body;
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

module.exports = router;