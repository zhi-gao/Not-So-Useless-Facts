const express = require("express");
const cors = require("cors");
const { initDatabase } = require("./database");
require("dotenv").config();

const userRouter = require("./routes/userRoutes");

const PORT = process.env.PORT || 4000;
const app = express();

app.use(express.json());
app.use(cors({
    credentials : true,
    origin : [process.env.DEV_MODE != "production" ? "*" : process.env.FRONTEND_HOST]
}));

app.get("/", (req, res) => res.json({status : "OK"}));
app.use(userRouter);

initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is listening on PORT ${PORT}`);
    });
}).catch(err => {
    console.error(err);
});



