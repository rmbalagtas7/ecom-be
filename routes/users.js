const express = require("express");
const router = express.Router();
const UserController = require("../controllers/users");

router.get('/', UserController.getAll);
router.post("/register", UserController.register);
router.post("/auth", UserController.auth);
router.post("/verify-otp", UserController.verifyOtp);
router.post("/request-new-otp", UserController.resendOtp);
router.post("/request-password-reset", UserController.requestPasswordReset);
router.post("/reset-password", UserController.resetPassword);
module.exports = router;