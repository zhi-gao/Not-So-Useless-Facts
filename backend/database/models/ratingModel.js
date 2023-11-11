/*
A model specifically for rating comments. 
Users can either upvote or downvote a comment. They can also just not vote.
When user votes, that data gets added to this schema
If the user votes the same thing twice, then it should count as a no-vote
Instead of removing it, as it may cause issues if someone decides to spam-click a vote,
we can just change the state of Rated. 
This means that when someone votes on a comment, we must search if they have voted on it before
*/

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ratingSchema = new Schema({
    userId:{
        type : [mongoose.Types.ObjectId],
        required: true
    },
    factId:{
        type : [mongoose.Types.ObjectId],
        required: true
    },
    rated: {
        type: Boolean,
        required: true
    },
    rating:{
        type: Boolean,
        required: false
    }
}, {timestamps: true})

module.exports = mongoose.model('Rating', ratingSchema)