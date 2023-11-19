const initDatabase = require("./initDatabase");
const {insertFact} = require("./insert");
const {fetchLatestFact} = require("./fetch");

module.exports = {
    initDatabase,
    insertFact,
    fetchLatestFact
}