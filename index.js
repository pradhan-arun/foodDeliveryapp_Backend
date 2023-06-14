const express = require('express');
const app = express();

const connection = require('./Connections/mongoConnections')

app.use(express.json());

connection();

app.listen(7000,()=>{
    console.log("running at 7000")
})