const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
// const factController = require("../controllers/apiFactsController")

router.post("/user/login", userController.loginController);
router.post("/user/logout", userController.logoutController);
router.post("/user/register", userController.registerController);

router.post("/user/auth", userController.authController);

router.post("/comments/c", userController.postCommentController);
router.get("/comments", userController.getCommentsController);

module.exports = router;