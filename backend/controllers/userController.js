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

/**
 * Upvote fact controller
 * Functionality of a user clicking the upvote fact goes here
 * Requires user and fact
 * Steps:
 * find existence of fact
 * find existence of user
 * find if the user already upvoted/downvoted fact
 * if already upvoted, remove from user.upvotecomments, decrement fact.upvote
 */
async function upvoteFactController(req, res) {
    const {user, fact} = req.body

    // Make sure id is mongoose valid
    if(!mongoose.Types.ObjectId.isValid(user._id)){
        return res.status(404).json({error: "Id invalid"})
    }

    if(!mongoose.Types.ObjectId.isValid(fact._id)){
        return res.status(404).json({error: "Id invalid"})
    }

    // Find existance of user and fact
    const exist = await Login.findByID(user._id) || await Fact.findByID(fact._id)

    if(!exist){
        res.status(404).json({error: "Id does not exist"})
    }



    // const newUser = await Login.findOneAndUpdate(
    //     {_id: userID}, 
    //     {$addToSet: {upvoteFactController: [fact._id]}}, {new:true}
    // )

    // check if user exist
    if(!newUser){
        return res.status(404).json({error: "Internal Serivce Error"})
    }

    // update fact
    const updatedFact = Fact.findOneAndUpdate(
        {_id: fact._id},
        {$inc: {totalrating: 1}}
    )

    // check if fact exist
    if(!updatedFact){
        return res.status(404).json({error: "Internal Service Error"})
    }

    res.status(200).json(user)
}

/**
 * Downvote fact controller 
 * Functionality of a user clicking the downvote fact goes here
 */
async function downvoteFactController(req, res) {

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