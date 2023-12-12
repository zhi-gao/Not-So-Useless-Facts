const Facts = require("./models/factModel");
const Login = require("./models/loginModel");

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

        const addedFact = await Facts.findOne({fact : fact});
        return addedFact;

    } catch (err) {
        console.error(`An error has occurred while inserting a new fact`);
        console.error(err);
        return null;
    }
}

async function insertUser(username, email, password) {
    try {
        await Login.create({username, hashedPassword : password, email});
    } catch (err) {
        throw err;
    }
}

module.exports = {
    insertFact,
    insertUser,
}