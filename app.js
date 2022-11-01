const express = require('express');
const mysql = require("./config/mysql");
const cors = require("cors");

const LocalPort = require("./config/LocalPort");
const port = LocalPort.port;
const hostname = LocalPort.host;
const userRouter = require("./routers/userRouter");
const bankRouter = require("./routers/bankRouter");
const departmentRouter = require("./routers/departmentRouter");
const workTypeRouter = require("./routers/workTypeRouter");

const app = express();

app.set('port', process.env.PORT || port);

const server = async () => {
    try {
        await mysql;
        app.use(cors({origin: "http://localhost:3000"}));
        app.use(express.json());
        app.use("/users", userRouter);
        app.use("/bank", bankRouter);
        app.use("/department", departmentRouter);
        app.use("/workType", workTypeRouter);

        app.listen(port, hostname, () => {
            console.log("DB connect SUCCESS");
        });
    }catch(error) {
        console.log(error);
        console.log("DB connect FAIL");
    }
}

server();