const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const factController = require("../controllers/apiFactsController")

router.post("/user/login", userController.loginController);
router.post("/user/register", userController.registerController);
router.get("/facts", factController.getFactsController);
router.post("/comments/c", userController.postCommentController);
router.get("/comments", userController.getCommentsController);


module.exports = router;