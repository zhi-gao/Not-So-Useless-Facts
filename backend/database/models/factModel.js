/*
    Model for the Facts.
*/

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const factModel = new Schema({
    fact:{
        type: String,
        required: true,
        unique: true
    },
    
    totalUpvotes: {
        type: Number,
        required: true,
    },

    totalDownvotes : {
        type: Number,
        required: true
    },

    comments: {
        type: [mongoose.Types.ObjectId],
        required: false
    },

    sourceFrom : {
        type : String,
        required: true
    }

}, {timestamps: true})

module.exports = mongoose.model('Fact', factModel)