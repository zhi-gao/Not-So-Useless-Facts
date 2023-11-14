/*
Model for the Facts.
Title is required and unique. 
Description is required as well
*/

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const factModel = new Schema({
    title:{
        type: String,
        required: true,
        unique: true //??
    },
    description:{
        type: String,
        required: true,
    },
    totalRating:{
        type: Number,
        default: 0
    }
}, {timestamps: true})

module.exports = mongoose.model('Fact', factModel)