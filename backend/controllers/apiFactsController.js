const axios = require("axios");
const { default: mongoose } = require('mongoose');
const { insertFact, fetchLatestFact} = require("../database");
const { findUserById, findFactById, fetchAllFacts } = require("../database/fetch");
const { insertUpvoteFact, insertDownvoteFact } = require("../database/insert");

const MAIN_FACTS_API = "https://api.api-ninjas.com/v1/facts?limit=1";
const BACKUP_FACTS_API = "https://uselessfacts.jsph.pl/api/v2/facts/random";

async function factOfTheDayController(_, res) {
    // use api-ninja's api as default

    // search in the db if we have already documentated today's fact
    const latestFact = await fetchLatestFact();
    const currentDate = new Date().toDateString();

    // daily fact found and is already in db
    if(latestFact && new Date(currentDate).getTime() == new Date(latestFact.createdAt).getTime()) {
        return res.json({status : "OK", fact : latestFact, sourcedFrom: `${latestFact.sourceFrom} cached`});
    }

    // cannot find a fact in db
    try {
        const apiRes = await axios.get(MAIN_FACTS_API, {
            headers : {
                "X-Api-Key": process.env.API_NINJA_API_KEY
            }
        });

        const data = apiRes.data;
        if(!data) return res.status(500).json({status : "API did not respond with a body"});
    
        const fact = data[0]?.fact;
        if(!fact) return res.status(500).json({status : "Fact was not retrived"});

        // make a entry into the db
        const addedFacts = await insertFact(fact, "api-ninja");

        return res.json({status : "OK", fact : addedFacts, sourcedFrom: "api-ninja"});
    } catch (err) {
        console.error(err);
        
        // if there is an issue with the api-ninja api, use the other free api instead
        const apiRes = await axios.get(BACKUP_FACTS_API);
        const data = apiRes.data;
    
        if(!data) return res.status(500).json({status : "API did not respond with a body"});
    
        const fact = data.text;
    
        if(!fact) return res.status(500).json({status : "Fact was not retrived"});
    
        // make a entry into the db
        const addedFacts = await insertFact(fact, "useless-facts")

        return res.json({status : "OK", fact : addedFacts, sourcedFrom : "useless-facts"});    
    }
}

/*
 * Upvote fact controller
 * Functionality of a user clicking the upvote fact goes here
 * Requires userId and factId
 * Steps:
 * find existence of fact
 * find existence of user
 * find if the user already upvoted/downvoted fact
 * if already upvoted, remove from user.upvotecomments, decrement fact.upvote
 */
async function upvoteFactController(req, res) {
    const {userId, factId} = req.body

    // Make sure id is mongoose valid
    if(!mongoose.Types.ObjectId.isValid(userId)){
        return res.status(404).json({error: "User Id invalid"})
    }

    if(!mongoose.Types.ObjectId.isValid(factId)){
        return res.status(404).json({error: "Fact Id invalid"})
    }

    // Find existance of user and fact
    const userExist = await findUserById(userId)

    if(!userExist){
        res.status(404).json({error: `${userId} does not exist`})
    }

    const factExist = await findFactById(factId)

    if(!factExist){
        res.status(404).json({error: `${factId} does not exist`})
    }

    try{
        //check if user already upvoted/downvoted
        upvoteExist = userExist.upvotedFacts.includes(factId)
        downvoteExist = userExist.downvotedFacts.includes(factId)

        // if factId doesnt exist in either, add to login.upvoteFacts and increment fact.upvote
        if(!upvoteExist && !downvoteExist){
            // add factId to user.upvotedFacts
            userExist.upvotedFacts.push(factId);
            await userExist.save();

            // increment fact.upvote
            factExist.totalUpvotes += 1;
            await factExist.save();

            return res.status(200).json({msg: factExist})
        }
        
        // if factId only exist in upvote, remove from login.upvotedFacts and decrement fact.upvote
        if(upvoteExist && !downvoteExist){
            // remvoe factId from user.upvotedFacts
            userExist.upvotedFacts.pull(factId);
            await userExist.save();

            // decrement fact.upvote
            factExist.totalUpvotes -= 1;
            await factExist.save()

            return res.status(200).json({msg: factExist})
        }

        // if factId only exist in downvote, remove from login.downvoteFacts, add to login.upvoteFacts, decrement fact.downvote, increment fact.upvote
        if(!upvoteExist && downvoteExist){
            // remove factId from user.downvoteFacts and add to user.upvoteFacts
            userExist.downvotedFacts.pull(factId);
            userExist.upvotedFacts.push(factId)
            await userExist.save();

            // increment fact.upvoteFacts and decrement fact.downvoteFacts
            factExist.totalDownvotes -= 1;
            factExist.totalUpvotes += 1;
            await factExist.save()

            return res.status(200).json({msg: factExist})
        }

        // if factId exist in both, remove from both
        // if(upvoteExist && downvoteExist){
        //     throw err;
        // }

    }catch (err){
        console.error(err)
        return res.status(404).json({error: err})
    }
}

/**
 * Downvote fact controller 
 * Functionality of a user clicking the downvote fact goes here
 * Requires user and fact
 * Steps:
 * find existence of fact
 * find existence of user
 * find if the user already upvoted/downvoted fact
 * if already downvoted, remove fro muser.downvotecomments, decrement fact.downvote
 */
async function downvoteFactController(req, res) {
    const {userId, factId} = req.body

    // Make sure id is mongoose valid
    if(!mongoose.Types.ObjectId.isValid(userId)){
        return res.status(404).json({error: `User ${userId} invalid`})
    }

    if(!mongoose.Types.ObjectId.isValid(factId)){
        return res.status(404).json({error: `Fact ${factId} invalid`})
    }

    // Find existance of user and fact
    const userExist = await findUserById(userId)

    if(!userExist){
        res.status(404).json({error: `${userId} does not exist`})
    }

    const factExist = await findFactById(factId)

    if(!factExist){
        res.status(404).json({error: `${factId} does not exist`})
    }

    try{
        //check if user already upvoted/downvoted
        upvoteExist = userExist.upvotedFacts.includes(factId)
        downvoteExist = userExist.downvotedFacts.includes(factId)

        // if factId doesnt exist in either, add to login.downvoteFacts and increment fact.downvote
        if(!upvoteExist && !downvoteExist){
            // add factId to user.downvotedFacts
            userExist.downvotedFacts.push(factId);
            await userExist.save();

            // increment fact.downvote
            factExist.totalDownvotes += 1;
            await factExist.save();

            return res.status(200).json({msg: factExist})
        }

        // if factId only exist in downvote, remove from login.downvotedFacts and decrement fact.downvote
        if(!upvoteExist && downvoteExist){
            // remove factId from user.downvotedFacts
            userExist.downvotedFacts.pull(factId);
            await userExist.save();

            // decrement fact.upvote
            factExist.totalDownvotes -= 1;
            await factExist.save()

            return res.status(200).json({msg: factExist})
        }

        // if factId only exist in upvote, remove from login.upvoteFacts, add to login.downvoteFacts, decrement fact.upvote, increment fact.downvote
        if(upvoteExist && !downvoteExist){
            // remove factId from user.upvoteFacts and add to user.downvoteFacts
            userExist.upvotedFacts.pull(factId);
            userExist.downvotedFacts.push(factId)
            await userExist.save();

            // increment fact.upvoteFacts and decrement fact.downvoteFacts
            factExist.totalUpvotes -= 1;
            factExist.totalDownvotes += 1;
            await factExist.save()

            return res.status(200).json({msg: factExist})
        }

    }catch (err){
        console.error(err)
        return res.status(404).json({error: err})
    }
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
        const facts = await fetchAllFacts();
        return res.json(facts)

    } catch (err){
        console.error(err)
        return res.status(500).json({error: "Internal Server Error"});
    }
}

/*
Get a Fact
Requires: factId
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

/*
Get All UpVoted Facts from User
Requires: userId
Steps:
Validate and check userId
Get Ids from Users upvoteFacts
Find all matching Ids in FactDB
Return them
*/
async function getUserUpvoteFactsController(req, res){
    const { id } = req.body
    console.log(id)
    // Make sure id is mongoose valid
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: `${id} is invalid`})
    }

    // Find existance of either. May be a problem if somehow user and facts share id.
    const idExist = await findUserById(id)

    // Return if nonexistance
    if(!idExist) {
        return res.status(404).json({error: `${id} is does not exist`})
    }

    try{
        // Get comments id
        const upvoteFactsIds = idExist.upvotedFacts;

        // get all comments based on id
        const facts = await findFactById(upvoteFactsIds);

        // return comments
        return res.json(facts)
    } catch (error){
        console.error(error)
        return res.status(500).json({error: "Internal Server Error"})
    }
}

/*
Get All Downvoted Facts from User
Requires: userId
Steps:
Validate and check userId
Get Ids from Users Downvoted
Find all matching Ids in FactDB
Return them
*/
async function getUserDownvoteFactsController(req, res){
    const { id } = req.body
    console.log(id)
    // Make sure id is mongoose valid
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: `${id} is invalid`})
    }

    // Find existance of either. May be a problem if somehow user and facts share id.
    const idExist = await findUserById(id)

    // Return if nonexistance
    if(!idExist) {
        return res.status(404).json({error: `${id} is does not exist`})
    }

    try{
        // Get comments id
        const downvoteFactsIds = idExist.downvotedFacts;

        // get all comments based on id
        const facts = await findFactById(downvoteFactsIds);

        // return comments
        return res.json(facts)
    } catch (error){
        console.error(error)
        return res.status(500).json({error: "Internal Server Error"})
    }
}

module.exports = {
    factOfTheDayController,
    upvoteFactController,
    downvoteFactController,
    getFactsController,
    getUserUpvoteFactsController,
    getUserDownvoteFactsController
}