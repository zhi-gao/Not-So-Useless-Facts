/**
 * User login controller 
 * Functionality of processing the login request goes here
*/
const SALT_ROUNDS = 10
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { default: mongoose } = require('mongoose')
const { findUserWithEmail, userExists, findFactById, findUserById, findCommentById, findCommentsByIds } = require('../database/fetch')
const { insertUser, insertComment, insertReport, updateRefreshToken } = require('../database/insert')
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

        return res.status(200).json(foundUser.username)
    }catch(err){
        console.error(err)
        return res.status(500).json({err: err})
    }
}


// COMMENTS CONTROLLERS

/*
 * User upvote comment
 * Requires: Userid, CommentId
 * Steps:
 * Validate both ids and check for existance
 * find if the user already upvoted/downvoted comment
 * if already upvoted, remove from user.upvotecomments, decrement comment.upvote
 */
async function upvoteCommentController(req, res) {
    const {userId, commentId} = req.query

    // Make sure id is mongoose valid
    if(!mongoose.Types.ObjectId.isValid(userId)){
        return res.status(404).json({error: `User ${userId} invalid`})
    }

    if(!mongoose.Types.ObjectId.isValid(commentId)){
        return res.status(404).json({error: `Comment ${commentId} invalid`})
    }

    // Find existance of user and comment
    const userExist = await findUserById(userId)

    if(!userExist){
        res.status(404).json({error: `User ${userId} does not exist`})
    }

    const commentExist = await findCommentById(commentId)

    if(!commentExist){
        res.status(404).json({error: `Comment ${commentId} does not exist`})
    }

    try{
        //check if user already upvoted/downvoted
        upvoteExist = userExist.upvotedComments.includes(commentId)
        downvoteExist = userExist.downvotedComments.includes(commentId)

        // if commentId doesnt exist in either, add to login.upvoteComments and increment comment.upvote
        if(!upvoteExist && !downvoteExist){
            // add commentId to user.upvotedComment
            userExist.upvotedComments.push(commentId);
            await userExist.save();

            // increment comment.upvote
            commentExist.totalUpvotes += 1;
            await commentExist.save();

            return res.status(200).json({msg: commentExist})
        }
        
        // if commentId only exist in upvote, remove from login.upvotedComment and decrement comment.upvote
        if(upvoteExist && !downvoteExist){
            // remvoe commentId from user.upvotedComment
            userExist.upvotedComments.pull(commentId);
            await userExist.save();

            // decrement comment.upvote
            commentExist.totalUpvotes -= 1;
            await commentExist.save()

            return res.status(200).json({msg: commentExist})
        }

        // if commentId only exist in downvote, remove from login.downvoteComments, add to login.upvoteComment, decrement comment.downvote, increment comment.upvote
        if(!upvoteExist && downvoteExist){
            // remove commentId from user.downvoteComments and add to user.upvoteComments
            userExist.downvotedComments.pull(commentId);
            userExist.upvotedComments.push(commentId);
            await userExist.save();

            // increment comment.upvoteComments and decrement comment.downvoteComments
            commentExist.totalDownvotes -= 1;
            commentExist.totalUpvotes += 1;
            await commentExist.save()

            return res.status(200).json({msg: commentExist})
        }

        if (upvoteExist && downvoteExist) {
            throw new Error('Comment exists in both upvote and downvote.');
        }

    }catch (err){
        console.error(err)
        return res.status(404).json({error: error.message})
    }
}

/*
 * User downvote comment
 * Requires: Userid, CommentId
 * Steps:
 * Validate both ids and check for existance
 * find if the user already upvoted/downvoted comment
 * if already downvoted, remove from user.downvotecomments, decrement comment.downvote
 */
async function downvoteCommentController(req, res) {
    // const {userId, commentId} = req.body
    const { userId, commentId } = req.query;

    // Make sure id is mongoose valid
    if(!mongoose.Types.ObjectId.isValid(userId)){
        return res.status(404).json({error: `User ${userId} invalid`})
    }

    if(!mongoose.Types.ObjectId.isValid(commentId)){
        return res.status(404).json({error: `Comment ${commentId} invalid`})
    }

    // Find existance of user and comment
    const userExist = await findUserById(userId)

    if(!userExist){
        res.status(404).json({error: `${userId} does not exist`})
    }

    const commentExist = await findCommentById(commentId)

    if(!commentExist){
        res.status(404).json({error: `${commentId} does not exist`})
    }

    try{
        //check if user already upvoted/downvoted
        upvoteExist = userExist.upvotedComments.includes(commentId)
        downvoteExist = userExist.downvotedComments.includes(commentId)

        // if commentId doesnt exist in either, add to login.downvoteComments and increment comment.downvote
        if(!upvoteExist && !downvoteExist){
            // add commentId to user.downvotedComment
            userExist.downvotedComments.push(commentId);
            await userExist.save();

            // increment comment.upvote
            commentExist.totalDownvotes += 1;
            await commentExist.save();

            return res.status(200).json({msg: commentExist})
        }
        
        // if commentId only exist in downvote, remove from login.downvotedComment and decrement comment.downvote
        if(!upvoteExist && downvoteExist){
            // remvoe commentId from user.upvotedComment
            userExist.downvotedComments.pull(commentId);
            await userExist.save();

            // decrement comment.upvote
            commentExist.totalDownvotes -= 1;
            await commentExist.save()

            return res.status(200).json({msg: commentExist})
        }

        // if commentId only exist in upvote, remove from login.upvoteComments, add to login.downvoteComment, decrement comment.upvote, increment comment.downvote
        if(upvoteExist && !downvoteExist){
            // remove commentId from user.downvoteComments and add to user.upvoteComments
            userExist.upvotedComments.pull(commentId);
            userExist.downvotedComments.push(commentId);
            await userExist.save();

            // increment comment.upvoteComments and decrement comment.downvoteComments
            commentExist.totalUpvotes -= 1;
            commentExist.totalDownvotes += 1;
            await commentExist.save()

            return res.status(200).json({msg: commentExist})
        }

        if (upvoteExist && downvoteExist) {
            throw new Error('Comment exists in both upvote and downvote.');
        }

    }catch (err){
        console.error(err)
        return res.status(404).json({error: error.message})
    }
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
                                comment: comment,
                                totalUpvotes: 0,
                                totalDownvotes: 0
                                })
        
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

// REPORT CONTROLLERS

/*
    User filing a report on another User or Fact
    Requires: UserId of reporter, recipientId being reported on, recipienttype = ['User', 'Fact'], flags types (depends on type)
    Validate userId 
    Validate recipientId
    Check if ModelType is appropriate string
    Get Id from appropriate model
    Check if exist
*/
async function reportController(req, res){
    // const {userId, recipientId, recipientType, flag} = req.body;
    const {userId, recipientId, recipientType, flag, comment} = req.query;
    console.log(req.query)
    recipientExist = "None";

    if(!mongoose.Types.ObjectId.isValid(userId)){
        return res.status(404).json({error: `UserId ${userId} is invalid`});
    }

    if(!mongoose.Types.ObjectId.isValid(recipientId)){
        return res.status(404).json({error: `ComplaintId ${recipientId} is invalid`});
    }

    if(recipientType !== 'User' && recipientType !== 'Fact'){
        return res.status(404).json({error: `RecipientType '${recipientType}' is invalid`});
    }

    if(recipientType === "User"){
        recipientExist = await findUserById(recipientId)
    }

    if(recipientType === "Fact"){
        recipientExist = await findFactById(recipientId)
    }

    if(!recipientExist){
        return res.status(404).json({error: `Recipient ${recipientExist} is does not exist`})
    }

    try{
        const report = await insertReport({userId: userId, recipientId: recipientExist.id, recipientType: recipientType, flag: flag, comment: comment})
        console.log("Report: ", report)
        return res.status(202).json({msg: report})
    }catch(err){
        console.error(err)
        return res.status(500).json({error: err.message})
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
    reportController
}