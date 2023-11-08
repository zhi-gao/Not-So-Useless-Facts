const mongoose = require("mongoose");
require("dotenv").config();

const DATABASE_URL = process.env.DATABASE_URL || "";

module.exports = async () => {
    try {
        console.log(`Init database connection...`);
        await mongoose.connect(DATABASE_URL);
        console.log(`Database connection successfully established`);
    } catch (err) {
        console.error(`Cannot establish connection`);
        throw err;
    }
}