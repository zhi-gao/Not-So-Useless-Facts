const express = require("express");
const router = express.Router();
const controller = require("../controllers/userController");

router.post("/user/login", controller.loginController);
router.post("/user/logout", controller.logoutController);
router.post("/user/register", controller.registerController);
router.get("/facts", controller.getFactsController);
router.post("/comments/c", controller.postCommentController);
router.get("/comments", controller.getCommentsController);
router.post("/user/auth", controller.authController);

module.exports = router;