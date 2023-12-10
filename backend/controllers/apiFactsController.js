const axios = require("axios");
const { insertFact, fetchLatestFact} = require("../database");
const Login = require('../database/models/loginModel')
const Fact = require('../database/models/factModel')

const MAIN_FACTS_API = "https://api.api-ninjas.com/v1/facts?limit=1";
const BACKUP_FACTS_API = "https://uselessfacts.jsph.pl/api/v2/facts/random";

async function factOfTheDayController(_, res) {
    // use api-ninja's api as default

    // search in the db if we have already documentated today's fact
    const latestFact = await fetchLatestFact();
    const currentDate = new Date().toDateString();

    // daily fact found and is already in db
    if(latestFact && new Date(currentDate).getTime() == new Date(latestFact.createdAt).getTime()) {
        return res.json({status : "OK", fact : latestFact.fact, sourcedFrom: `${latestFact.sourceFrom} cached`});
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
        await insertFact(fact, "api-ninja");

        return res.json({status : "OK", fact, sourcedFrom: "api-ninja"});
    } catch (err) {
        console.error(err);
        
        // if there is an issue with the api-ninja api, use the other free api instead
        const apiRes = await axios.get(BACKUP_FACTS_API);
        const data = apiRes.data;
    
        if(!data) return res.status(500).json({status : "API did not respond with a body"});
    
        const fact = data.text;
    
        if(!fact) return res.status(500).json({status : "Fact was not retrived"});
    
        // make a entry into the db
        insertFact(fact, "useless-facts")

        return res.json({status : "OK", fact, sourcedFrom : "useless-facts"});    
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
    const userExist = await Login.findByID(user._id)

    if(!userExist){
        res.status(404).json({error: `${user._id} does not exist`})
    }

    const factExist = await Fact.findByID(fact._id)

    if(!factExist){
        res.status(404).json({error: `${fact._id} does not exist`})
    }

    try{
        //check if user already upvoted/downvoted
        upvoteExist = Login.upvotedFacts.includes(fact._id)
        downvoteExist = Login.downvotedFacts.includes(fact._id)

        // if fact._id doesnt exist in either, add to login.upvoteFacts and increment fact.upvote
        if(!upvoteExist && !downvoteExist){
            // add fact._id to user.upvotedFacts
            userExist.upvotedFacts.push(fact._id);
            await userExist.save();

            // increment fact.upvote
            // const updatedFact = await Fact.findOneAndUpdate(
            //     {_id: fact._id},
            //     {$inc: {totalUpvotes: 1}},
            //     {new: true}
            // )

            // increment fact.upvote
            factExist.totalUpvotes += 1;
            await factExist.save();

            return res.status(200).json({msg: factExist})
        }
        
        // if fact._id only exist in upvote, remove from login.upvotedFacts and decrement fact.upvote
        if(upvoteExist && !downvoteExist){
            // remvoe fact._id from user.upvotedFacts
            userExist.upvotedFacts.pull(fact._id);
            await userExist.save();

            // decrement fact.upvote
            // const updatedFact = await Fact.findOneAndUpdate(
            //     {_id: fact._id},
            //     {$inc: {totalUpvotes: -1}},
            //     {new: true}
            // )

            // decrement fact.upvote
            factExist.totalUpvotes -= 1;
            await factExist.save()

            return res.status(200).json({msg: factExist})
        }

        // if fact._id only exist in downvote, remove from login.downvoteFacts, add to login.upvoteFacts, decrement fact.downvote, increment fact.upvote
        if(!upvoteExist && downvoteExist){
            // remvoe fact._id from user.downvoteFacts and add to user.upvoteFacts
            userExist.downvotedFacts.pull(fact._id);
            userExist.upvotedFacts.push(fact._id)
            await userExist.save();

            // increment fact.upvoteFacts and decrement fact.downvoteFacts
            // const updatedFact = await Fact.findOneAndUpdate(
            //     {_id: fact._id},
            //     {$inc: {upvoteFacts: 1, downvoteFacts: -1}},
            //     {new: true}
            // )

            // increment fact.upvoteFacts and decrement fact.downvoteFacts
            factExist.totalDownvotes -= 1;
            factExist.totalUpvotes += 1;
            await factExist.save()

            return res.status(200).json({msg: factExist})
        }

        // if fact._id exist in both, remove from both
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
    const {user, fact} = req.body

    // Make sure id is mongoose valid
    if(!mongoose.Types.ObjectId.isValid(user._id)){
        return res.status(404).json({error: "Id invalid"})
    }

    if(!mongoose.Types.ObjectId.isValid(fact._id)){
        return res.status(404).json({error: "Id invalid"})
    }

    // Find existance of user and fact
    const userExist = await Login.findByID(user._id)

    if(!userExist){
        res.status(404).json({error: `${user._id} does not exist`})
    }

    const factExist = await Fact.findByID(fact._id)

    if(!factExist){
        res.status(404).json({error: `${fact._id} does not exist`})
    }

    try{
        //check if user already upvoted/downvoted
        upvoteExist = Login.upvotedFacts.includes(fact._id)
        downvoteExist = Login.downvotedFacts.includes(fact._id)

        // if fact._id doesnt exist in either, add to login.downvoteFacts and increment fact.downvote
        if(!upvoteExist && !downvoteExist){
            // add fact._id to user.downvotedFacts
            userExist.downvotedFacts.push(fact._id);
            await userExist.save();

            // increment fact.downvote
            // const updatedFact = await Fact.findOneAndUpdate(
            //     {_id: fact._id},
            //     {$inc: {totalUpvotes: 1}},
            //     {new: true}
            // )

            // increment fact.downvote
            factExist.totalDownvotes += 1;
            await factExist.save();

            return res.status(200).json({msg: factExist})
        }

        // if fact._id only exist in downvote, remove from login.downvotedFacts and decrement fact.downvote
        if(upvoteExist && !downvoteExist){
            // remvoe fact._id from user.downvotedFacts
            userExist.downvotedFacts.pull(fact._id);
            await userExist.save();

            // decrement fact.downvote
            // const updatedFact = await Fact.findOneAndUpdate(
            //     {_id: fact._id},
            //     {$inc: {totalUpvotes: -1}},
            //     {new: true}
            // )

            // decrement fact.upvote
            factExist.totalDownvotes -= 1;
            await factExist.save()

            return res.status(200).json({msg: factExist})
        }

        // if fact._id only exist in upvote, remove from login.upvoteFacts, add to login.downvoteFacts, decrement fact.upvote, increment fact.downvote
        if(!upvoteExist && downvoteExist){
            // remvoe fact._id from user.upvoteFacts and add to user.downvoteFacts
            userExist.upvotedFacts.pull(fact._id);
            userExist.downvotedFacts.push(fact._id)
            await userExist.save();

            // increment fact.upvoteFacts and decrement fact.downvoteFacts
            // const updatedFact = await Fact.findOneAndUpdate(
            //     {_id: fact._id},
            //     {$inc: {upvoteFacts: 1, downvoteFacts: -1}},
            //     {new: true}
            // )

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
        const facts = await Fact.find(); //add filters/sorts here

        return res.status(200).json(facts)
    } catch (err){
        console.error(err)
        return res.status(500).json({error: "Internal Server Error"});
    }
}

module.exports = {
    factOfTheDayController,
    upvoteFactController,
    downvoteFactController,
    getFactsController
}