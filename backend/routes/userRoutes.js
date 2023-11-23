const express = require("express");
const router = express.Router();
const controller = require("../controllers/userController");


router.post("/user/login", controller.loginController);
router.post("/user/register", controller.registerController);

router.get("/facts", controller.getFactsController);
router.post("/facts/upvote", controller.upvoteFactController)
router.post("/facts/downvote", controller.downvoteFactController)

router.post("/comments/c", controller.postCommentController);
router.get("/comments", controller.getCommentsController);


module.exports = router;