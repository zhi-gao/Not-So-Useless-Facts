const express = require("express");
const cors = require("cors");
require("dotenv").config();

const PORT = process.env.PORT || 4000;
const app = express();

app.use(express.json());
app.use(cors({
    credentials : true,
    origin : [process.env.DEV_MODE != "production" ? "*" : process.env.FRONTEND_HOST]
}));

app.get("/", (req, res) => res.json({status : "OK"}))

app.listen(PORT, () => {
    console.log(`Server is listening on PORT ${PORT}`);
});

