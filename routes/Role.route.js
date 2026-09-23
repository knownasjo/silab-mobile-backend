const express = require("express");
const { verifyAccessToken } = require("../helpers/jwt_helper");
const router = express.Router();
const RoleController = require("../controller/Role.controller.js");

router.get("/", verifyAccessToken, RoleController.getAllRoles);

router.get("/:id", verifyAccessToken);

router.post("/", verifyAccessToken, RoleController.addRole);

router.patch("/:id", verifyAccessToken, RoleController.updateRole);

router.delete("/:id", verifyAccessToken, RoleController.deleteRole);

module.exports = router;
