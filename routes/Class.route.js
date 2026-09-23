const express = require("express");
const router = express.Router();
const { verifyAccessToken } = require("../helpers/jwt_helper");
const ClassController = require("../controller/Class.controller.js");

router.get("/", verifyAccessToken, ClassController.getAllClasses);

router.post("/details", verifyAccessToken, ClassController.getClassesDetails);

router.get(
  "/status",
  verifyAccessToken,
  ClassController.getUserRegistrationStatus
);

router.patch(
  "/register",
  verifyAccessToken,
  ClassController.registerToClassRoom
);

router.get(
  "/register/:nim",
  verifyAccessToken,
  ClassController.getUserRegisteredClass
);

router.get("/:id", verifyAccessToken, ClassController.getClass);

router.post("/", verifyAccessToken, ClassController.addClasses);

router.patch("/:id", verifyAccessToken, ClassController.updateClass);

router.delete("/:id", verifyAccessToken, ClassController.deleteClass);

router.patch(
  "/unregister/:id",
  verifyAccessToken,
  ClassController.unregisterFromClassRoom
);

module.exports = router;
