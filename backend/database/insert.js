const Fact = require("./models/factModel");
const Login = require("./models/loginModel");
const Comment = require("./models/commentModel");
const Report = require("../database/models/reportModel")

async function insertFact(fact, source) {
    try {
        await Fact.create({
            fact : fact,
            comments : [],
            totalUpvotes : 0,
            totalDownvotes : 0,
            sourceFrom: source,
            createdAt : new Date().toDateString()
        });

        const addedFact = await Fact.findOne({fact : fact});
        return addedFact;

    } catch (err) {
        console.error(`An error has occurred while inserting a new fact`);
        console.error(err);
        return null;
    }
}

async function insertUser(username, email, password) {
    try {
        await Login.create({username, hashedPassword : password, email});
    } catch (err) {
        throw err;
    }
}

async function updateRefreshToken(userEmail, token) {
    try {
        const user = await Login.findOne({email : userEmail});
        if(!user) throw new Error("User not found");

        user.refreshTokens.push(token);
        await user.save();
    } catch (err) {
        throw err;
    }
}

async function insertComment({factId, userId, comment, totalUpvotes, totalDownvotes}) {
    try {
        const createComment = await Comment.create({factId, userId, comment, totalUpvotes, totalDownvotes})

        // update Fact
        await Fact.findByIdAndUpdate(
            factId,
            {$push: {comments: createComment._id}},
            {new: true}
        )
        // update users
        await Login.findByIdAndUpdate(
            userId,
            {$push: {comments: createComment._id}},
            {new: true}
        )

        return createComment;
    } catch (err) {
        throw err;
    }
}

async function insertUpvoteFact(userId, factId) {
    try {
        const user = await Login.findById(userId);
        if(!user) throw new Error("User not found");

        const fact = await Fact.findById(factId);
        if(!user) throw new Error("Fact not found");

        // if upvoteFact already exist in User.upvoteFacts
        if(user.upvotedFacts.includes(factId)){
            //remove it from User.upvotedFacts
            const updatedUser = await Login.findByIdAndUpdate(
                userId,
                { $pull: { upvotedFacts: factId } },
                {new: true}
            );
    
            //decrement Facts.totalUpvotes
            const updatedFact = await Fact.findByIdAndUpdate(
                factId,
                { $inc: { totalUpvotes: -1 } },
                {new: true}
            );
            
            return;
        }

        //if upvoteFact already exist in User.downvoteFacts
        if(user.downvotedFacts.includes(factId)){
            //remove it from User.downvotedFacts & add it to User.updatedFacts
            const updatedUser = await Login.findByIdAndUpdate(
                userId,
                { $pull: {downvotedFacts: factId}, $push: {upvotedFacts: factId}},
                { new: true}
            )

            //decrement Facts.totalDownvotes & increment Facts.totalUpvotes
            const updatedFact = await Fact.findByIdAndUpdate(
                factId,
                { $inc: {totalDownvotes: -1, totalUpvotes: 1}},
                { new: true }
            )

            return;
        }

        //if upvotedFact doesnt exist in either, just add and increment
        const updatedUser = await Login.findByIdAndUpdate(
            userId,
            { $push: { upvotedFacts: factId }},
            { new: true } // move 'new: true' here
        );
        
        const updatedFact = await Fact.findByIdAndUpdate(
            factId,
            { $inc: { totalUpvotes: 1 } },
            { new: true } // move 'new: true' here
        );

        return;
    } catch (err) {
        throw err;
    }
}

async function insertDownvoteFact(userId, factId) { 
    try {
        // Find existance of user and fact
        const userExist = await Login.findById(userId)

        if(!userExist) throw new Error("User not found");

        const factExist = await Login.findById(factId)

        if(!factExist) throw new Error("Fact not found");

        // if upvoteFact already exist in User.downvotedFact
        if(userExist.downvotedFacts.includes(factId)){
            //remove it from User.downvotedFacts
            const updatedUser = await Login.findByIdAndUpdate(
                userId,
                { $pull: { downvotedFacts: factId } },
                {new: true}
            );

            //decrement Facts.totalUpvotes
            const updatedFact = await Fact.findByIdAndUpdate(
                factId,
                { $inc: { totalDownvotes: -1 } },
                {new: true}
            );

            return;
        }
        //if downvoteFact already exist in User.upvoteFacts
        if(userExist.upvotedFacts.includes(factId)){
            //remove it from User.downvotedFacts & add it to User.updatedFacts
            const updatedUser = await Login.findByIdAndUpdate(
                userId,
                { $pull: {upvotedFacts: factId}, $push: {downvotedFacts: factId}},
                { new: true}
            )

            //decrement Facts.totalDownvotes & increment Facts.totalUpvotes
            const updatedFact = await Fact.findByIdAndUpdate(
                factId,
                { $inc: {totalUpvotes: -1, totalDownvotes: 1}},
                { new: true }
            )

            return;
        }
        //if upvotedFact doesnt exist in either, just add and increment
        const updatedUser = await Login.findByIdAndUpdate(
            userId,
            { $push: { downvotedFacts: factId }},
            { new: true } // move 'new: true' here
        );
        
        const updatedFact = await Fact.findByIdAndUpdate(
            factId,
            { $inc: { totalDownvotes: 1 } },
            { new: true } // move 'new: true' here
        );

        return;
    } catch (err) {
        throw err;
    }
}

async function insertReport({userId, recipientId, recipientType, flag, comment}){
    try{
        const report = await Report.create({
            userId: userId,
            recipientId: recipientId,
            recipientType: recipientType,
            flag: flag,
            comment: comment
            })
        console.log("report2: ", report)
        return report;
    }catch(err){
        console.error("An error has occured when inserting comment");
        console.error(err);
        return null;
    }
}

module.exports = {
    insertFact,
    insertUser,
    updateRefreshToken,
    insertComment,
    insertUpvoteFact,
    insertDownvoteFact,
    insertReport
}