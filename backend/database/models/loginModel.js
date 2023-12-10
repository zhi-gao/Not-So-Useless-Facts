/*
Standard login info. 
Both username and password is required.
Only issue is if we are doing some auth, then maybe some issue
*/
const mongoose = require('mongoose')

const Schema = mongoose.Schema

const loginSchema = new Schema({
    username:{
        type: String,
        required: true,
        unique: true
    },

    email : {
        type : String,
        required : true,
        unique : true,
    },

    hashedPassword:{
        type: String,
        required: true
    },

    upvotedFacts : {
        type : [mongoose.Types.ObjectId],
        required : false,        
    },

    downvotedFacts : {
        type : [mongoose.Types.ObjectId],
        required : false,        
    },

    upvotedComments : {
        type : [mongoose.Types.ObjectId],
        required : false,
    },

    downvotedComments : {
        type : [mongoose.Types.ObjectId],
        required : false,
    },

    comments : {
        type : [mongoose.Types.ObjectId],
        required : false,
    },
}, {timestamps: true})

module.exports = mongoose.model('Login', loginSchema)