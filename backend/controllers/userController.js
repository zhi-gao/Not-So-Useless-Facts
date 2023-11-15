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
        //successful login
        req.session.user = {id: user._id, username: user.username}; ???
        res.json({message: 'Login Successful', user: req.session.user})
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
    req.session.destroy((err) => {
        if(err){
            console.error(err)
            return res.status(500).json({message: "Internal Server Error"})
        }

        res.json({message: "Logout Successful"})
    })
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
 */
async function upvoteFactController(req, res) {
    const {user, fact} = req.body

    /* 
    need to search for its existances first, then calculate it. 3 cases: 
    fact._id doesnt exist in upvoteDB/downvoteDB -> add to upvoteDB and increment fact.totalRating
    fact._id exist in upvoteDB -> remove from upvoteDB and decrement fact.totalRating
    fact._id exist in downvoteDB -> remove from downvoteDB, add to upvoteDB, and 2*increment fact.totalRating
    */ 

    const newUser = await Login.findByID(user._id)

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
 */
async function postCommentController(req, res) {

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
}