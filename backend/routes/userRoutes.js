const express = require("express");
const router = express.Router();
const controller = require("../controllers/userController");

router.post("/user/login", controller.loginController);
router.post("/user/logout", controller.logoutController);
router.post("/user/register", controller.registerController);

router.post("/user/auth", controller.authController);

router.get("/user/search", controller.getUserController);

router.post("/comments/c", controller.postCommentController);
router.get("/comments", controller.getCommentsController);

module.exports = router;