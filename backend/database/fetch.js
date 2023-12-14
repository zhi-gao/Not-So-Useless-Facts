const Comment = require("./models/commentModel")
const Fact = require("./models/factModel")
const Login = require("./models/loginModel");

async function fetchLatestFact() {
    try {
        const latestFact = await Fact.findOne().sort({"createdAt" : -1});
        return latestFact;
    } catch (err) {
        console.error(`An error has occurred while fetching the latest fact`);
        console.error(err);
        return null;
    }
}

async function fetchAllFacts() {
    try {
        const facts = await Fact.find();
        return facts;
    } catch (err) {
        console.log(err);
        return [];
    }
}

async function findUserWithEmail(email) {
    try {
        const user = await Login.findOne({email : email});
        return user;
    } catch (err) {
        console.log(err);
        return null;
    }
}

async function findUserById(id) {
    try {
        const user = await Login.findById(id);
        return user;
    } catch (err) {
        console.log(err);
        return null;
    }
}

async function userExists(username, email, id=null) {
    if(id !== null) {
        try {
            const exist = await Login.exists({_id : id});
            return exist != null ? true : false;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

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

async function findFactById(factId) {
    try {
        const fact = Fact.findById(factId);
        return fact;
    } catch (err) {
        console.log(err);
        return null;
    }
}

// returns array of facts
async function findFactsById(factIds) {
    try {
        const facts = await Fact.find({ _id: { $in: factIds } });
        return facts;
    } catch (err) {
        console.log(err);
        return null;
    }
}

async function findCommentByIds(commentIds) {
    try {
        const comments = await Comment.findById(commentIds);
        return comments;
    } catch (err) {
        throw err;
    }
}

async function findCommentsByIds(commentIds) {
    try {
        const comments = await Comment.find({_id: {$in: commentIds }});
        return comments;
    } catch (err) {
        throw err;
    }
}

module.exports = {
    fetchLatestFact,
    fetchAllFacts,
    findUserWithEmail,
    userExists,
    findUserById,
    findFactById,
    findFactsById,
    findCommentByIds,
    findCommentsByIds,
}