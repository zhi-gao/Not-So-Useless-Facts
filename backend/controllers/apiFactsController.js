const axios = require("axios");
const { insertFact, fetchLatestFact} = require("../database");

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

module.exports = {
    factOfTheDayController,
}