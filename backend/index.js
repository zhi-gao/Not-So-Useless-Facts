const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { initDatabase } = require("./database");
require("dotenv").config();

const userRouter = require("./routes/userRoutes");
const apiFactsRouter = require("./routes/factsApiRoutes");

const PORT = process.env.PORT || 4000;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin : "http://localhost:5173",
    credentials : true,    
}));

app.get("/", (req, res) => res.json({status : "OK"}));
app.use(userRouter);
app.use(apiFactsRouter);

initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is listening on PORT ${PORT}`);
    });
}).catch(err => {
    console.error(err);
});