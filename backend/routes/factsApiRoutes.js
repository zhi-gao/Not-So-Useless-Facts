const express = require("express");
const router = express.Router();
const controller = require("../controllers/apiFactsController");

router.get("/facts/today", controller.factOfTheDayController);

module.exports = router;