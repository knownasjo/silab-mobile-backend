const createError = require("http-errors");
const Role = require("../models/Role.model");
const { roleSchema } = require("../helpers/validation_schema");

async function getAllRoles(req, res, next) {
  try {
    const roles = await Role.find();

    const response = {
      status: 200,
      message: "success",
      data: {
        roles: roles.map((role) => ({
          name: role.name,
          desc: role.desc,
        })),
      },
    };

    res.send(response);
  } catch (error) {
    next(error);
  }
}

async function addRole(req, res, next) {
  try {
    const result = await roleSchema.validateAsync(req.body);

    const doesExist = await Role.findOne({ name: result.name });
    if (doesExist) throw createError.Conflict("Role Already Added");

    const role = new Role(result);
    const savedRole = await role.save();

    const response = {
      status: 201,
      message: "added",
      data: {
        name: savedRole.name,
        desc: savedRole.desc,
      },
    };

    res.send(response);
  } catch (error) {
    next(error);
  }
}

async function updateRole(req, res, next) {
  try {
    const { id } = req.params;

    const role = await Role.findById(id);
    if (!role) throw createError.NotFound("Role Not Found.");

    const updateData = req.body;
    const updatedRole = await Role.findOneAndUpdate(
      { _id: id },
      { $set: updateData },
      { returnOriginal: false }
    );

    const respone = {
      status: 200,
      message: "success",
      data: {
        name: updatedRole.name,
        desc: updatedRole.desc,
      },
    };

    res.send(respone);
  } catch (error) {
    next(error);
  }
}

async function deleteRole(req, res, next) {
  try {
    const { id } = req.params;

    const doesExist = await Role.findById(id);
    if (!doesExist) throw createError.NotFound("Role Not Found.");

    await Role.deleteOne({ _id: id });

    const response = {
      status: 200,
      message: "deleted",
    };

    res.send(response);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllRoles,
  addRole,
  updateRole,
  deleteRole,
};
