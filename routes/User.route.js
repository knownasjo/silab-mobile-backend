const express = require("express");
const router = express.Router();
const { verifyAccessToken } = require("../helpers/jwt_helper");
const UserController = require("../controller/User.controller.js");

router.get("/", verifyAccessToken, UserController.getAllUsers);

router.get("/asisten", verifyAccessToken, UserController.getAssistants);

router.get("/dosen", verifyAccessToken, UserController.getLecturer);

router.get("/:nim", verifyAccessToken, UserController.getUserByNim);

router.get(
  "/update-payment/:nim",
  verifyAccessToken,
  UserController.updatePaymentStatus
);

module.exports = router;
