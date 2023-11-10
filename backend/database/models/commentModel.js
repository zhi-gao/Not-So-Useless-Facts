/*
Model for comments. 
Users can create comments or not
Users should not be able to post empty text
*/

const mongoose = require.resolve('mongoose')
const Schema = mongoose.Schema

const commentSchema = new Schema ({
    userId:{
        type: Number,
        required: true
    },
    factId:{
        type: Number,
        required: true
    },
    comment:{
        type: String,
        required: true
    }
}, {timestamps: true})

module.exports = mongoose.model('Comment', commentSchema)