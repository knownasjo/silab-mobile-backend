const express = require("express");
const router = express.Router();
const AuthController = require("../controller/Auth.controller.js");

router.post("/register", AuthController.register);

router.post("/login", AuthController.login);

router.post("/refresh-token");

router.delete("/logout");

router.post("/verify-otp", AuthController.verifyOtp);

router.post("/resend-otp", AuthController.resendOtpVerificationEmail);

router.post("/reset-password", AuthController.resetPassword);

router.post("/send-reset-password-otp", AuthController.sendResetPasswordOtp);

router.post(
  "/resend-reset-password-otp",
  AuthController.resendResetPasswordOtp
);

router.post(
  "/verify-reset-password-otp",
  AuthController.verifyResetPasswordOtp
);

module.exports = router;
