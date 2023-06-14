const mongoose = require('mongoose');


const DB =`mongodb://localhost:27017/food_app`;


const connection = () => {

    mongoose.connect(DB).then(() =>{
        console.log('connection successfull');
    }).catch((err)=> console.log('no connection'));
} 

module.exports = connection;