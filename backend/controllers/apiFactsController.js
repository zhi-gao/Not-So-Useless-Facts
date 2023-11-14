const axios = require("axios");

const MAIN_FACTS_API = "https://api.api-ninjas.com/v1/facts?limit=1";
const BACKUP_FACTS_API = "https://uselessfacts.jsph.pl/api/v2/facts/random";

async function insertFactIntoDatabase(fact) {
    // TODO
}

async function factOfTheDayController(_, res) {
    // use api-ninja's api as default

    // TODO
    // search in the db if we have already documentated today's fact
    // if we have, fetch from our own db, else call the 3red part api to get a new fact
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

        // TODO
        // make a entry into the db
        insertFactIntoDatabase(fact);

        return res.json({status : "OK", fact});
    } catch (err) {
        console.error(err);
        
        // if there is an issue with the api-ninja api, use the other free api instead
        const apiRes = await axios.get(BACKUP_FACTS_API);
        const data = apiRes.data;
    
        if(!data) return res.status(500).json({status : "API did not respond with a body"});
    
        const fact = data.text;
    
        if(!fact) return res.status(500).json({status : "Fact was not retrived"});
    
        // TODO
        // make a entry into the db
        insertFactIntoDatabase(fact);

        return res.json({status : "OK", fact});    
    }
}

module.exports = {
    factOfTheDayController,
}