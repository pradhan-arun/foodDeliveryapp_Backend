const express = require('express');
const cors = require('cors')
const app = express();
require('dotenv').config();
const connection = require('./Connections/mongoConnections')
app.use(cors())
app.use(express.json());

const userRouter = require('./Routes/users');
app.use('/', userRouter);

connection();

app.listen(8001,()=>{
    console.log("running at 8001")
})