const Fact = require("./models/factModel")
const Login = require("./models/loginModel");

async function removeRefreshToken(userEmail, refreshToken) {
    try {
        const user = await Login.findOne({email : userEmail});
        if(!user) throw new Error("User not found");

        user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
        await user.save();

    } catch (err) {
        throw err;
    }
}

module.exports = {
    removeRefreshToken,
}