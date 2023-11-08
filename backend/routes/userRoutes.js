const express = require("express");
const router = express.Router();
const controller = require("../controllers/userController");

router.post("/user/login", controller.loginController);
router.post("/user/register", controller.registerController);

module.exports = router;