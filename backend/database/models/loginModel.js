/*
Standard login info. 
Both username and password is required.
Only issue is if we are doing some auth, then maybe some issue
*/
const mongoose = require('mongoose')

const Schema = mongoose.Schema

const loginSchema = new Schema({
    userName:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    }
}, {timestamps: true})

module.exports = mongoose.model('Login', loginSchema)