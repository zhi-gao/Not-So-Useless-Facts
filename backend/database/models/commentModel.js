/*
Model for comments. 
Users can create comments or not
Users should not be able to post empty text
*/

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const commentSchema = new Schema ({
    userId:{
        type : mongoose.Types.ObjectId,
        required: true
    },
    factId:{
        type : mongoose.Types.ObjectId,
        required: true
    },
    comment:{
        type: String,
        required: true
    }
}, {timestamps: true})

module.exports = mongoose.model('Comment', commentSchema)