const express = require("express");
const router = express.Router();
const controller = require("../controllers/userController");

router.post("/user/login", controller.loginController);
router.post("/user/logout", controller.logoutController);
router.post("/user/register", controller.registerController);

router.post("/user/auth", controller.authController);

router.post("/user/search", controller.getUserController);

router.post("/comments/c", controller.postCommentController);
router.post("/comments", controller.getCommentsController);
router.post("/comments/upvote", controller.upvoteCommentController);
router.post("/comments/downvote", controller.downvoteCommentController);
router.get("/comments/test", controller.test);

module.exports = router;