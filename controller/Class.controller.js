const createError = require("http-errors");
const Class = require("../models/Class.model");
const { classSchema } = require("../helpers/validation_schema");
const Subject = require("../models/Subject.model");
const User = require("../models/User.model");
const { supabase } = require("../helpers/init_supabase");

async function getAllClasses(req, res, next) {
  try {
    const classes = await Class.find()
      .populate("subjectId")
      .populate("participants")
      .populate("assistants");
    const response = {
      status: 200,
      message: "success",
      data: classes,
    };

    res.send(response);
  } catch (error) {
    next(error);
  }
}

async function getClass(req, res, next) {
  try {
    const { id } = req.params;

    const classRoom = await Class.findById(id)
      .populate("subjectId")
      .populate("participants")
      .populate("assistants");
    if (!classRoom) throw createError.NotFound("Class Not Found.");

    const response = {
      status: 200,
      message: "success",
      data: classRoom,
    };

    res.send(response);
  } catch (error) {
    next(error);
  }
}

async function getClassesDetails(req, res, next) {
  try {
    const { classes } = req.body;

    if (!Array.isArray(classes)) {
      return res.status(400).json({
        status: 400,
        message: "subjects should be an array",
      });
    }

    const classesDetails = await Promise.all(
      classes.map(async (classId) => {
        const classDetails = await Class.findById(classId).populate(
          "subjectId"
        );
        if (!classDetails) {
          throw new Error(`Subject with id ${classId} not found`);
        }
        return classDetails.toJSON();
      })
    );

    const response = {
      status: 200,
      message: "success",
      data: classesDetails,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

async function addClass(req, res, next) {
  try {
    const result = await classSchema.validateAsync(req.body);

    const doesExist = await Class.findOne({
      subjectId: result.subjectId,
      name: result.name,
    });
    if (doesExist)
      throw createError.Conflict(`${result.name} is Already Added.`);

    const relatedSubject = await Subject.findById(result.subjectId);
    if (!relatedSubject) throw createError.NotFound("Subject Not Found.");

    const classRoom = new Class(result);
    await classRoom.save();

    const { error } = await supabase.from("class").insert({
      id: classRoom.id,
      quota: classRoom.quota,
    });

    if (error)
      throw createError.Conflict(`Supabase Database Class Error : `, error);

    relatedSubject.classes.push(classRoom._id);
    await relatedSubject.save();

    const response = {
      status: 201,
      message: "success",
    };

    res.send(response);
  } catch (error) {
    next(error);
  }
}

async function addClasses(req, res, next) {
  const { classes } = req.body;

  try {
    let response;
    let data = [];

    for (let index = 0; index < classes.length; index++) {
      const result = await classSchema.validateAsync(classes[index]);

      const doesExist = await Class.findOne({
        subjectId: result.subjectId,
        name: result.name,
      });
      if (doesExist)
        throw createError.Conflict(`${result.name} is Already Added.`);

      const relatedSubject = await Subject.findById(result.subjectId);
      if (!relatedSubject) throw createError.NotFound("Subject Not Found.");

      const classRoom = new Class(result);
      await classRoom.save();

      const { error } = await supabase.from("class").insert({
        id: classRoom.id,
        quota: classRoom.quota,
      });

      if (error)
        throw createError.Conflict(`Supabase Database Class Error : `, error);

      relatedSubject.classes.push(classRoom._id);
      await relatedSubject.save();

      data.push(classRoom);
    }

    response = {
      status: 200,
      message: "success",
      data: data,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

async function updateClass(req, res, next) {
  try {
    const { id } = req.params;

    const classRoom = await Class.findById(id);
    if (!classRoom) throw createError.NotFound("Class Not Found.");

    const filter = { _id: id };
    const updateData = req.body;

    if (Object.hasOwn(updateData, "subjectId")) {
      await Subject.findByIdAndUpdate(classRoom.subjectId, {
        $pull: { classes: classRoom._id },
      });
      await Subject.findByIdAndUpdate(updateData.subjectId, {
        $push: { classes: classRoom._id },
      });
    }

    const updatedClass = await Class.findOneAndUpdate(
      filter,
      {
        $set: updateData,
      },
      { returnOriginal: false }
    );

    const response = {
      status: 200,
      message: "success",
      data: updatedClass,
    };

    res.send(response);
  } catch (error) {
    next(error);
  }
}

async function deleteClass(req, res, next) {
  try {
    const { id } = req.params;

    const classRoom = await Class.findById(id);
    if (!classRoom) throw createError.NotFound("Class Not Found");

    const subjectId = classRoom.subjectId;
    await Subject.findOneAndUpdate(
      { _id: subjectId },
      { $pull: { classes: { _id: id } } },
      { returnOriginal: false }
    );

    await Class.deleteOne({ _id: id });

    const response = {
      status: 200,
      message: "deleted",
    };

    res.send(response);
  } catch (error) {
    next(error);
  }
}

async function registerToClassRoom(req, res, next) {
  try {
    const { nim, selectedClasses } = req.body;

    let response;
    let classes = [];

    const user = await User.findOne({ nim: nim });
    if (!user) throw createError.NotFound("User Not Found.");

    for (const key in selectedClasses) {
      const subject = await Subject.findById(key);
      if (!subject) throw createError.NotFound("Subject Not Found.");

      const classRoom = await Class.findById(selectedClasses[key]);
      if (!classRoom) throw createError.NotFound("Class Not Found.");

      let isFull =
        classRoom.isFull || classRoom.participants.length === classRoom.quota;
      if (isFull) throw createError.Conflict("Classroom is already full");

      const isRegistered = await Class.findOne({
        _id: selectedClasses[key],
        participants: user._id,
      });
      if (isRegistered) continue;

      let updatedClassRoom = await Class.findOneAndUpdate(
        { _id: selectedClasses[key] },
        {
          $push: {
            participants: {
              _id: user.id,
            },
          },
        },
        {
          returnOriginal: false,
        }
      );

      const { error } = await supabase.rpc("add class participants", {
        classid: classRoom.id,
      });
      if (error)
        throw createError.Conflict(
          `Supabase Add Class Participants Error : ${error.message}`
        );

      if (updatedClassRoom.participants.length === updatedClassRoom.quota)
        updatedClassRoom = await Class.findOneAndUpdate(
          filter,
          { $set: { isFull: true } },
          { returnOriginal: false }
        );

      let selectedClass = {};
      selectedClass["subjectName"] = subject.name;
      selectedClass["className"] = updatedClassRoom.name;
      classes.push(selectedClass);
    }

    response = {
      status: 200,
      message: "registered",
      data: classes,
    };

    res.send(response);
  } catch (error) {
    next(error);
  }
}

async function unregisterFromClassRoom(req, res, next) {
  try {
    const { userId } = req.body;
    const { id } = req.params;

    const user = await User.findById(userId);
    if (!user) throw createError.NotFound("User Not Found.");

    const classRoom = await Class.findById(id);
    if (!classRoom) throw createError.NotFound("Class Not Found.");

    const isRegistered = await Class.findOne({
      _id: id,
      "participants._id": user.id,
    });
    if (!isRegistered) throw createError.Conflict("User Not Registered");

    let updatedClassRoom = await Class.findOneAndUpdate(
      { _id: classRoom._id },
      {
        $pull: {
          participants: { _id: user._id },
        },
      },
      {
        returnOriginal: false,
      }
    );

    if (updatedClassRoom.participants.length < updatedClassRoom.quota)
      updatedClassRoom = await Class.findOneAndUpdate(
        { _id: classRoom._id },
        { $set: { isFull: false } },
        { returnOriginal: false }
      );

    updatedClassRoom = await Class.findById(id)
      .populate("subjectId")
      .populate("participants")
      .populate("assistants");

    const response = {
      status: 200,
      message: "unregistered",
      data: updatedClassRoom,
    };

    res.send(response);
  } catch (error) {
    next(error);
  }
}

async function getUserRegistrationStatus(req, res, next) {
  try {
    const { subjectId, nim } = req.query;

    const user = await User.findOne({ nim: nim });
    if (!user) throw createError.NotFound("User not found.");

    const subject = await Subject.findById(subjectId);
    if (!subject) throw createError.NotFound("Subject not found.");

    const classRegistration = await Class.findOne({
      subjectId: subjectId,
      participants: user.id,
    });

    const response = {
      status: 200,
      message: "success",
      data: classRegistration,
    };

    res.send(response);
  } catch (error) {
    next(error);
  }
}

async function getUserRegisteredClass(req, res, next) {
  try {
    const { nim } = req.params;

    const user = await User.findOne({ nim: nim });
    if (!user)
      throw createError.NotFound(`User with NIM : ${nim} is Not Found.`);

    const registeredClass = await Class.find({
      participants: user.id,
    }).populate("subjectId");

    res.status(200).json({
      status: 200,
      message: "success",
      data: registeredClass,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllClasses,
  getClass,
  addClass,
  updateClass,
  deleteClass,
  registerToClassRoom,
  unregisterFromClassRoom,
  getUserRegistrationStatus,
  getUserRegisteredClass,
  getClassesDetails,
  addClasses,
};
