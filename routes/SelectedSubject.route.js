const express = require("express");
const router = express.Router();
const { verifyAccessToken } = require("../helpers/jwt_helper");
const SelectedSubjectController = require("../controller/SelectedSubject.controller.js");

router.get(
  "/",
  verifyAccessToken,
  SelectedSubjectController.getAllSelectedSubjects
);

router.get(
  "/:nim",
  verifyAccessToken,
  SelectedSubjectController.getSelectedSubjectAndClass
);

router.patch(
  "/",
  verifyAccessToken,
  SelectedSubjectController.updateSelectedSubject
);

module.exports = router;
