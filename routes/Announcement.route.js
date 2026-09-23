const express = require("express");
const router = express.Router();
const AnnouncementController = require("../controller/Announcement.controller");
const { verifyAccessToken } = require("../helpers/jwt_helper");
const multer = require("multer");

const upload = multer();

router.get("/", verifyAccessToken, AnnouncementController.getAllAnnouncements);

router.get("/:id", verifyAccessToken, AnnouncementController.getAnnouncement);

router.post(
  "/",
  verifyAccessToken,
  upload.single("file"),
  AnnouncementController.addAnnouncement
);

router.patch(
  "/:id",
  verifyAccessToken,
  upload.single("file"),
  AnnouncementController.editAnnouncement
);

router.delete(
  "/:id",
  verifyAccessToken,
  AnnouncementController.deleteAnnouncement
);

module.exports = router;
