const Facts = require("./models/factModel");

async function insertFact(fact, source) {
    try {
        await Facts.create({
            fact : fact,
            comments : [],
            totalUpvotes : 0,
            totalDownvotes : 0,
            sourceFrom: source,
            createdAt : new Date().toDateString()
        });

        const data = await Facts.find({fact : fact});
    } catch (err) {
        console.error(`An error has occurred while inserting a new fact`);
        console.error(err);
        return null;
    }
}

module.exports = {
    insertFact
}