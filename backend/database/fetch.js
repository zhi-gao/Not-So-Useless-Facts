const Facts = require("./models/factModel")
const Login = require("./models/loginModel");

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

async function findUserWithEmail(email) {
    try {
        const user = await Login.findOne({email : email});
        return user;
    } catch (err) {
        throw err;
    }
}

async function userExists(username, email) {
    try {
        const usernameExist = await Login.exists({username: {$regex: new RegExp(username, 'i')}});
        if(usernameExist) {
            return true;
        }

        const emailExist = await Login.exists({email: {$regex: new RegExp(email, 'i')}});
        if(emailExist) {
            return true;
        }

        return false;

    } catch (err) {
        throw err;
    }
}

module.exports = {
    fetchLatestFact,
    findUserWithEmail,
    userExists,
}