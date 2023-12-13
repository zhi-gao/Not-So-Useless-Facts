const express = require("express");
const router = express.Router();
const controller = require("../controllers/userController");

router.post("/user/login", controller.loginController);
router.post("/user/logout", controller.logoutController);
router.post("/user/register", controller.registerController);

router.post("/user/auth", controller.authController);

router.post("/comments/c", controller.postCommentController);
router.post("/comments", controller.getCommentsController);

module.exports = router;