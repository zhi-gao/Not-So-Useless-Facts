/**
 * User login controller 
 * Functionality of processing the login request goes here
*/
const SALT_ROUNDS = 10
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { default: mongoose } = require('mongoose')
const { findUserWithEmail, userExists, findFactById, findUserById, findCommentsByIds } = require('../database/fetch')
const { insertUser, insertComment, updateRefreshToken } = require('../database/insert')
const { removeRefreshToken } = require('../database/delete')


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
                const user = await findUserWithEmail(decodedRefreshToken.email);
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
    console.log(email, password)
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

        await updateRefreshToken(email, refreshToken);

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

        await removeRefreshToken(email, refreshToken);

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
Searches and returns one user
Requires: UserId
Steps:
Validates userId
searches loginDB
returns if found
*/
async function getUserController(req, res) {
    const { id } = req.body
    console.log("UserId: ", id)

    // Make sure id is mongoose valid
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: `${id} is invalid`})
    }

    try{
        // Get User
        const foundUser = await findUserById(id)

        // Return if not found
        if(!foundUser){
            return res.status(404).json({error: `User ${id} does not exist`})
        }

        return res.status(200).json(foundUser)
    }catch(err){
        console.error(err)
        return res.status(500).json({err: err})
    }
}


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

    const userExist = await userExists(null, null, userId);
    
    if(!userExist){
        return res.status(404).json({error: "User does not exist"})
    }

    const factExist = await findFactById(factId);

    if(!factExist){
        return res.status(404).json({error: "Fact does not exist"})
    }

    try{
        const newComment = await insertComment({
                                userId: userId, 
                                factId: factId, 
                                comment: comment})
        
        console.log(newComment);
        return res.json(newComment)

    }catch(error){
        console.error(error)
        return res.status(500).json({error: 'Internal Server Error'})
    }
}

/*
Get all Comments made by user or attached to facts
Requires: User id or Fact id
Steps:
Validate id
Find id in UserDB/FactDB
Retrieve and return comments
*/
async function getCommentsController(req, res){
    const { id } = req.body
    console.log("UserId: ", id)
    // Make sure id is mongoose valid
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: `${id} is invalid`})
    }

    // Find existance of either. May be a problem if somehow user and facts share id.
    const idExist = await findUserById(id) || await findFactById(id)

    // Return if nonexistance
    if(!idExist) {
        return res.status(404).json({error: `${id} is does not exist`})
    }

    try{
        // Get comments id
        const commentIDs = idExist.comments;

        // get all comments based on id
        const comments = await findCommentsByIds(commentIDs);
        
        // return comments
        return res.json(comments)
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
    getUserController,
    upvoteCommentController,
    downvoteCommentController,
    postCommentController,
    getCommentsController,
}