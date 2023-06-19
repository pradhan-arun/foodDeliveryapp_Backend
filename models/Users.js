const mongoose = require('mongoose');


const usersSchema = mongoose.Schema({
    userType:{
        type:String,
        lowercase:true,
        enum:["user","admin"],
        default:"user"
    },
    fullName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    }
});

module.exports = mongoose.model('User',usersSchema);