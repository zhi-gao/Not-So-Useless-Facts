const Facts = require("./models/factModel")

async function fetchLatestFact() {
    try {
        const latestFact = await Facts.findOne().sort({"createdAt" : -1});
        return latestFact;
    } catch (err) {
        console.error(`An error has occurred while fetching the latest fact`);
        console.error(err);
        return null;
    }
}

module.exports = {
    fetchLatestFact,
}