const express = require("express");
const router = express.Router();
const controller = require("../controllers/userController");

router.post("/user/login", controller.loginController);
router.post("/user/logout", controller.logoutController);
router.post("/user/register", controller.registerController);
router.post("/user/auth", controller.authController);

module.exports = router;