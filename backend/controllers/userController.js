/**
 * User login controller 
 * Functionality of processing the login request goes here
*/
const Login = require('../database/models/loginModel')
const Fact = require('../database/models/factModel')
const Rating = require('../database/models/ratingModel')
const Comment = require('../database/models/commentModel')
const SALT_ROUNDS = 10
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { default: mongoose } = require('mongoose')

// LOGIN CONTROLLERS

async function loginController(req, res) {
    const { username, password } = req.body;

    // return res.json({username, password})

    try{
        const user = await (Login.findOne({username}))

        // check if user exist
        if(!user){
            return res.status(401).json({message: "Error: Incorrect Login"})
        }

        // Compare password with encrypted password
        const isPasswordValid = await bcrypt.compare(password, user.hashedPassword)

        if(!isPasswordValid){
            return res.status(401).json({message: "Error: Incorrect Login"})
        }

        // Generate jwt token
        const token = jwt.sign({user: user._id, username: user.username}, 'your-secret-key', {expiresIn: '1h'})

        //successful login
        res.json({message: 'Login Successful', token})
    } catch (error){
        console.error(error)
        res.status(500).json({message: "Internal Server Error"})
    }
}

/**
 * User Logout controller
 * Functionality of processing the logout request goes here
 */
async function logoutController(req, res) {
    try{
        res.clearCooke('jwtToken')

        res.json({message: "Logged out Successful"})
    }catch (error){
        console.error(error);
        res.status(500).json({message: "Internal Server Error"})
    }
}

/**
 * User Register Controller
 * Functionality of processing the register request goes here
 */
async function registerController(req, res) {
    const {username, password, email} = req.body

    // console.log(`${username}, ${password}, ${email}`)

    const usernameExist = await Login.exists({username: {$regex: new RegExp(username, 'i')}});

    if(usernameExist){
        return res.status(400).json({message: "Username already exist"})
    }

    const emailExist = await Login.exists({email: {$regex: new RegExp(email, 'i')}});

    if(emailExist){
        return res.status(400).json({message: "Email already exist"})
    }

    try{
        // encrypt password
        const salt = await bcrypt.genSalt(SALT_ROUNDS)

        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = {username, hashedPassword, email};

        const createUser = await Login.create(newUser)

        res.status(200).json({message: "User registration successful", user: newUser})
    } catch (err) {
        console.error("Error during registration: ", err);
    }
}


// FACTS CONTROLLERS

/**
 * Upvote fact controller
 * Functionality of a user clicking the upvote fact goes here
 * Requires userId and factId
 * Steps:
 * find existence of fact
 * find existence of user
 * find if the user already upvoted/downvoted fact
 * if already upvoted, remove from user.upvotefact, decrement fact.upvote
 * if already downvoted, remove from user.downvotefact, add to user.upvotefact, decrement fact.downvote, increment fact.upvote
 * else add to user.upvotefact, increment fact.upvote
 */
async function upvoteFactController(req, res) {
    const {userId, factId} = req.body

    // Make sure id is mongoose valid
    if(!mongoose.Types.ObjectId.isValid(userId)){
        return res.status(404).json({error: "Id invalid"})
    }

    if(!mongoose.Types.ObjectId.isValid(factId)){
        return res.status(404).json({error: "Id invalid"})
    }

    // Find existance of user and fact
    const userExist = await Login.findById(userId)

    if(!userExist){
        res.status(404).json({error: "Id does not exist"})
    }

    const factExist = await Fact.findById(factId)

    if(!factExist){
        res.status(404).json({error: "Id does not exist"})
    }

    // if upvoteFact already exist in User.upvoteFacts
    if(userExist.upvotedFacts.includes(factId)){
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

        return res.json({ message: '3. Fact Successfully remove upvote', user: updatedUser, fact: updatedFact });
    }
    //if upvoteFact already exist in User.downvoteFacts
    if(userExist.downvotedFacts.includes(factId)){
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

        return res.json({ message: '2. Fact Successfully upvote from downvote', user: updatedUser, fact: updatedFact });
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

    return res.json({ message: '1. Fact Successfully upvoted', user: updatedUser, fact: updatedFact });
}

/**
 * Downvote fact controller
 * Functionality of a user clicking the downvote fact goes here
 * Requires userId and factId
 * Steps:
 * find existence of fact
 * find existence of user
 * find if the user already upvoted/downvoted fact
 * if already downvoted, remove from user.downvote, decrement fact.downvote
 * if already upvoted, remove from user.upvotefact, add to user.downvotefact, decrement fact.upvote, increment fact.downvote
 * else add to user.downfact, increment fact.downvote
 */
async function downvoteFactController(req, res) {
    const {userId, factId} = req.body

    // Make sure id is mongoose valid
    if(!mongoose.Types.ObjectId.isValid(userId)){
        return res.status(404).json({error: "Id invalid"})
    }

    if(!mongoose.Types.ObjectId.isValid(factId)){
        return res.status(404).json({error: "Id invalid"})
    }

    // Find existance of user and fact
    const userExist = await Login.findById(userId)

    if(!userExist){
        res.status(404).json({error: "Id does not exist"})
    }

    const factExist = await Fact.findById(factId)

    if(!factExist){
        res.status(404).json({error: "Id does not exist"})
    }

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

        return res.json({ message: '3. Fact Successfully remove downvote', user: updatedUser, fact: updatedFact });
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

        return res.json({ message: '2. Fact Successfully downvote from upvote', user: updatedUser, fact: updatedFact });
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

    return res.json({ message: '1. Fact Successfully downvote', user: updatedUser, fact: updatedFact });
}

/* 
Get All Facts
Requires: nothing
Steps:
Get Facts db
Retrieve info and return them
Can have filters and sorts later
*/

async function getFactsController(req, res){
    try{
        const facts = await Fact.find(); //add filters/sorts here

        return res.status(200).json(facts)
    } catch (err){
        console.error(err)
        return res.status(500).json({error: "Internal Server Error"});
    }
}

/*
Get a Facts
Requires: factID
Steps:
Get Fact db
Retrieve info and return them
*/

/*
Get All Facts from User
Requires: User
Steps:
Validate and check User Id
Get Ids from Users upvoteFacts and downvoteFacts
Find all matching Ids in FactDB
Return them
Can have filters and sorts later
*/


// COMMENTS CONTROLLERS

/**
 * Upvote comment controller 
 * Functionality of a user clicking the upvote a comment goes here
 */
async function upvoteCommentController(req, res) {

}

/**
 * Downvote comment controller 
 * Functionality of a user clicking the downvote a comment goes here
 */
async function downvoteCommentController(req, res) {

}

/**
 * Post comment controller 
 * Functionality of a user post a comment to a fact goes here
 * Require User and Fact
 * Steps:
 * Validate and find User and Fact
 * Create Comment and Post to CommentDB
 * Add CommentId to User and Fact
 */
async function postCommentController(req, res) {
    const {userId, factId, comment} = req.body

    // validate id
    if(!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(factId)){
        return res.status(404).json({error: "Id invalid"})
    }

    const userExist = Login.findById(userId)
    
    if(!userExist){
        return res.status(404).json({error: "User does not exist"})
    }

    const factExist = Fact.findById(factId)

    if(!factExist){
        return res.status(404).json({error: "Fact does not exist"})
    }

    try{
        // create new comment
        const newComment = {
            userId: userId, 
            factId: factId, 
            comment: comment
        }
        const createComment = await Comment.create(newComment)

        // update facts
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

        return res.status(200).json(comment)

    }catch(error){
        console.error(error)
        return res.status(500).json({error: 'Internal Server Error'})
    }
}

/*
Get all Comments made by user
Requires: User or Fact id
Steps:
Validate id
Find id in UserDB/FactDB
Retrieve and return comments
*/
async function getCommentsController(req, res){
    const {id} = req.body

    // Make sure id is mongoose valid
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: "Id invalid"})
    }

    // Find existance of either. May be a problem if somehow user and facts share id.
    const iExist = await Login.findById(id) || await Fact.findById(id)

    // Return if nonexistance
    if(!iExist) {
        return res.status(404).json({error: "ID does not exist"})
    }

    try{
        // Get comments id
        const commentIDs = iExist.comments;

        // get all comments based on id
        const comments = await Comment.find({_id: {$in: commentIDs }})

        // return comments
        return res.status(200).json(comments)
    } catch (error){
        console.error(error)
        return res.status(500).json({error: "Internal Server Error"})
    }

}




module.exports = {
    loginController,
    logoutController,
    registerController,
    upvoteFactController,
    upvoteCommentController,
    downvoteFactController,
    downvoteCommentController,
    postCommentController,
    getFactsController,
    getCommentsController,
}