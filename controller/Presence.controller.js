const createError = require("http-errors");
const Presence = require("../models/Presence.model");
const User = require("../models/User.model");
const { presenceSchema } = require("../helpers/validation_schema");
const crypto = require("crypto");

async function getAllPresences(req, res, next) {
  try {
    const { classId } = req.query;

    if (classId) {
      const presence = await Presence.find({ classId: classId });
      if (!presence) throw createError.NotFound("Class Presence is Not Found");

      const response = {
        status: 200,
        message: "success",
        data: {
          presences: presence.map((presence) => ({
            id: presence._id,
            classId: presence.classId,
            date: presence.date,
            payload: presence.payload,
            participants: presence.participants,
          })),
        },
      };

      res.send(response);
    }

    const presence = await Presence.find();

    const response = {
      status: 200,
      message: "success",
      data: {
        presences: presence.map((presence) => ({
          id: presence._id,
          classId: presence.classId,
          date: presence.date,
          payload: presence.payload,
          participants: presence.participants,
        })),
      },
    };

    res.send(response);
  } catch (error) {
    next(error);
  }
}

async function addPresence(req, res, next) {
  try {
    const result = await presenceSchema.validateAsync(req.body);

    const payload = crypto.randomBytes(32).toString("hex");
    const presence = new Presence({
      classId: result.classId,
      date: result.date,
      payload: payload,
    });
    const savedPresence = await presence.save();

    const response = {
      status: 201,
      message: "success",
      data: {
        id: savedPresence._id,
        classId: savedPresence.classId,
        date: savedPresence.date,
        payload: savedPresence.payload,
      },
    };

    res.send(response);
  } catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

async function updatePresence(req, res, next) {
  try {
    const { id } = req.params;

    const presence = await Presence.findById(id);
    if (!presence) throw createError.NotFound("Class Presence Not Found.");

    updateData = req.body;
    const updatedPresence = await Presence.findOneAndUpdate(
      { _id: id },
      { $set: updateData },
      { returnOriginal: false }
    );

    const response = {
      status: 200,
      message: "success",
      data: {
        id: updatedPresence._id,
        classId: updatedPresence.classId,
        date: updatedPresence.date,
        payload: updatedPresence.payload,
      },
    };

    res.send(response);
  } catch (error) {
    next(error);
  }
}

async function updatePayload(req, res, next) {
  try {
    const { id } = req.params;

    const presence = await Presence.findById(id);
    if (!presence) throw createError.NotFound("Class Presence Not Found.");

    const newPayload = crypto.randomBytes(32).toString("hex");
    const updatedPayload = await Presence.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $set: {
          payload: newPayload,
        },
      },
      { returnOriginal: false }
    );

    const response = {
      status: 200,
      message: "success",
      data: {
        payload: updatedPayload.payload,
      },
    };

    res.send(response);
  } catch (error) {
    next(error);
  }
}

async function registerParticipant(req, res, next) {
  try {
    const { id } = req.params;
    const { userId, payload } = req.body;

    const presence = await Presence.findById(id);
    if (!presence) throw createError.NotFound("Class Presence Not Found.");

    const user = await User.findById(userId);
    if (!user) throw createError.NotFound("Invalid User");

    if (presence.payload !== payload)
      throw createError.Conflict("Payload Invalid");

    const doesUserExist = await Presence.findOne({
      _id: id,
      "participants._id": userId,
    });
    if (doesUserExist) throw createError.Conflict("User Already Presenced");

    await Presence.findOneAndUpdate(
      { _id: id },
      {
        $push: {
          participants: {
            _id: user.id,
            name: user.fullname,
          },
        },
      },
      { returnOriginal: false }
    );

    const response = {
      status: 200,
      message: "success",
    };

    res.send(response);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllPresences,
  addPresence,
  updatePresence,
  updatePayload,
  registerParticipant,
};
