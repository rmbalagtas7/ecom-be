const express = require("express");
const router = express.Router();
const UserController = require("../controllers/users");

router.get('/', UserController.getAll);
router.post("/register", UserController.register);
router.post("/auth", UserController.auth);
router.post("/verify-otp", UserController.verifyOtp);

module.exports = router;