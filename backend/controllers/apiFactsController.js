const axios = require("axios");
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
        return res.status(404).json({error: "User Id invalid"})
    }

    if(!mongoose.Types.ObjectId.isValid(factId)){
        return res.status(404).json({error: "Fact Id invalid"})
    }

    try {
        await insertUpvoteFact(userId, factId);
        return res.json({message : "OK"});

    } catch (err) {
        console.log(err);
        return res.status(500).json({message : "error upvoting facts"});
    }
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

    try {
        await insertDownvoteFact(userId, factId);
        return res.json({message : "OK"});
    } catch (err) {
        console.log(err);
        return res.status(500).json({message : "error downvoting fact"})
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


module.exports = {
    factOfTheDayController,
    upvoteFactController,
    downvoteFactController,
    getFactsController,
}