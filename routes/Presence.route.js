const express = require("express");
const router = express.Router();
const { verifyAccessToken } = require("../helpers/jwt_helper");
const PresenceController = require("../controller/Presence.controller.js");

router.get("/", verifyAccessToken, PresenceController.getAllPresences);

router.post("/", verifyAccessToken, PresenceController.addPresence);

router.patch("/:id", verifyAccessToken, PresenceController.updatePresence);

router.patch(
  "/:id/payload",
  verifyAccessToken,
  PresenceController.updatePayload
);

router.patch(
  "/:id/participants",
  verifyAccessToken,
  PresenceController.registerParticipant
);

router.delete("/:id", verifyAccessToken);

module.exports = router;
