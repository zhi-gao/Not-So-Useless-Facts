const express = require("express");
const router = express.Router();
const controller = require("../controllers/apiFactsController");

router.get("/facts/today", controller.factOfTheDayController);

router.get("/facts", controller.getFactsController);
router.post("/facts/userUpvotes", controller.getUserUpvoteFactsController);
router.post("/facts/userDownvotes", controller.getUserDownvoteFactsController);
router.post("/facts/upvote", controller.upvoteFactController);
router.post("/facts/downvote", controller.downvoteFactController);

module.exports = router;