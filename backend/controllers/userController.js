/**
 * User login controller 
 * Functionality of processing the login request goes here
*/
const Login = require('../database/models/loginModel')
const Fact = require('../database/models/factModel')
const SALT_ROUNDS = 10
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { default: mongoose } = require('mongoose')
const { findUserWithEmail, userExists } = require('../database/fetch')
const { insertUser } = require('../database/insert')

async function authController(req, res) {
    // get access token
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(400).send({status : "No auth header given"});
    }

    const line = authHeader.split(" ");

    // no auth token provided
    if (line.length < 2 || line[0] !== 'Bearer') {
        return res.status(401).send({status : "No bearer token given"});
    }

    const accessToken = line[1];

    // get current refresh token
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).send({status : "No refresh token given"});
    }

    const ACCESS_TOKEN_KEY = process.env.JWT_ACCESS_TOKEN_KEY;
    const REFRESH_TOKEN_KEY = process.env.JWT_REFRESH_TOKEN_KEY;

    // verify access token
    jwt.verify(accessToken, ACCESS_TOKEN_KEY, (err, decodedAccessToken) => {
        if (!err) {
            return res.json({
                user_id: decodedAccessToken.user_id,
                email: decodedAccessToken.email,
                username: decodedAccessToken.username,
                accessToken: accessToken,
            });
        };

        // access token err
        if (!err.message.includes("expire")) return res.send(500).json({status : "Error generated when trying to validate access token"});

        // verify that the refresh token
        jwt.verify(refreshToken, REFRESH_TOKEN_KEY, async (err, decodedRefreshToken) => {
            // expired refresh token
            if (err) {
                return res.status(403).json({status : "Refresh token expired"});
            }

            // token not expired
            try {
                // verify that refresh token is valid
                const user = await Login.findOne({email : decodedRefreshToken.email});
                if(!user) return res.status(401).json({status : "No user found"});

                const validRefreshTokens = user.refreshTokens

                if(validRefreshTokens.find(e => e === refreshToken) === undefined) {
                    return res.status(401).json({status : "Cannot find refresh token"});
                }

                // generate a new access token
                const newAccessToken = jwt.sign({user_id: decodedRefreshToken.user_id, username: decodedRefreshToken.username, email : decodedRefreshToken.email}, ACCESS_TOKEN_KEY, {expiresIn: '1h'});

                return res.json({
                    user_id: decodedRefreshToken.user_id,
                    email: decodedRefreshToken.email,
                    username: decodedRefreshToken.username,
                    accessToken: newAccessToken,
                });
                
            } catch (err) {
                console.error(err);
                return res.status(500).json({status : "Error generated when trying to generating a new access token"});
            }
        });
    });
}

async function loginController(req, res) {
    const { email, password } = req.body;

    try{
        const user = await findUserWithEmail(email);

        // check if user exist
        if(!user){
            return res.status(401).json({message: "Error: Incorrect Login"})
        }

        // Compare password with encrypted password
        const isPasswordValid = await bcrypt.compare(password, user.hashedPassword)

        if(!isPasswordValid){
            return res.status(401).json({message: "Error: Incorrect Login"})
        }

        // Generate both access and refresh tokens
        const ACCESS_TOKEN_KEY = process.env.JWT_ACCESS_TOKEN_KEY;
        const REFRESH_TOKEN_KEY = process.env.JWT_REFRESH_TOKEN_KEY;

        const newUser = {user_id: user._id, username: user.username, email : user.email}
        const accessToken = jwt.sign(newUser, ACCESS_TOKEN_KEY, {expiresIn: '1h'});

        const refreshToken = jwt.sign(newUser, REFRESH_TOKEN_KEY, {expiresIn: '7d'});

        user.refreshTokens.push(refreshToken);
        await user.save();

        //successful login
        res.cookie("refreshToken", refreshToken, {
            httpOnly : true
        });

        res.json({message: 'Login Successful', accessToken, 
            user_id : newUser.user_id,
            username : newUser.username,
            email : newUser.email
        });

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
        // remove refresh token from user profile
        const email = req.body.email;
        const refreshToken = req.cookies.refreshToken;
        
        const user = await findUserWithEmail(email);
        if(!user) return res.status({status : "No user found"});

        user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
        await user.save();

        res.json({status: "Logged out Successful"})
    }catch (error){
        console.error(error);
        res.status(500).json({status: "Internal Server Error"})
    }
}

/**
 * User Register Controller
 * Functionality of processing the register request goes here
 */
async function registerController(req, res) {
    const {username, password, email} = req.body

    const exist = await userExists(username, email);

    if(exist){
        return res.status(400).json({message: "Username already exist"})
    }

    try{
        // encrypt password
        const salt = await bcrypt.genSalt(SALT_ROUNDS)
        const hashedPassword = await bcrypt.hash(password, salt)

        await insertUser(username, email, hashedPassword);

        res.json({message: "User registration successful"})
    } catch (err) {
        console.error("Error during registration: ", err);
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
    authController,
    loginController,
    logoutController,
    registerController,
    upvoteCommentController,
    downvoteCommentController,
    postCommentController,
    getCommentsController,
}