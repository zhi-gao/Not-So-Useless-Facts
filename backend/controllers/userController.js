/**
 * User login controller 
 * Functionality of processing the login request goes here
*/
const Login = require('../database/models/loginModel')
const Fact = require('../database/models/factModel')
const SALT_ROUNDS = 10
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

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
        const user = await (Login.findOne({email}))

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
        
        const user = await Login.findOne({email : email});
        if(!user) return res.status({status : "No user found"});
        console.log({before : user});

        user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
        await user.save();

        const newUser = await Login.findOne({email : email});
        console.log({after : newUser});

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

        await Login.create({username, hashedPassword, email});

        res.json({message: "User registration successful"})
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
    authController,
    loginController,
    logoutController,
    registerController,
    upvoteFactController,
    upvoteCommentController,
    downvoteFactController,
    downvoteCommentController,
    postCommentController,
}