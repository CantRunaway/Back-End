const express = require('express');
const mysql = require("./config/mysql");

const port = 3000;
const hostname = "localhost";
const userRouter = require("./routers/userRouter");

const app = express();

app.set('port', process.env.PORT || 3000);

const server = async () => {
    try {
        await mysql;
        app.use(cors({origin: "http://localhost:8080"}));
        app.use(express.json());
        app.use("/users", userRouter);

        app.listen(port, hostname, () => {
            console.log("DB connect SUCCESS");
        });
    }catch(error) {
        console.log(error);
        console.log("DB connect FAIL");
    }
}

server();