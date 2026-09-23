const SelectedSubject = require("../models/SelectedSubject.model");
const createError = require("http-errors");
const User = require("../models/User.model");
const Subject = require("../models/Subject.model");
const Class = require("../models/Class.model");

async function getAllSelectedSubjects(req, res, next) {
  const { registered } = req.query;

  try {
    let selectedSubject;

    if (!registered) {
      selectedSubject = await SelectedSubject.find()
        .populate("userId")
        .populate("subjects");
    } else {
      selectedSubject = await SelectedSubject.find({
        subjects:
          registered === "1"
            ? {
                $ne: [],
              }
            : {
                $eq: [],
              },
      });
    }

    const response = {
      status: 200,
      message: "success",
      data: selectedSubject,
    };

    res.send(response);
  } catch (error) {
    next(error);
  }
}

async function getSelectedSubjectById(req, res, next) {
  try {
    const { id } = req.params;

    const selectedSubject = await SelectedSubject.findById(id)
      .populate("userId")
      .populate("subjects");
    if (!selectedSubject) throw createError.NotFound();

    const response = {
      status: 200,
      message: success,
      data: selectedSubject,
    };

    res.send(response);
  } catch (error) {
    next(error);
  }
}

async function getSelectedSubjectAndClass(req, res, next) {
  try {
    const { nim } = req.params;

    const user = await User.findOne({ nim: nim });
    if (!user) throw createError.NotFound("User not found.");

    const selectedSubjectByUserId = await SelectedSubject.findOne({
      userId: user._id,
    }).populate({
      path: "subjects",
      populate: {
        path: "classes",
        model: "class",
        populate: {
          path: "subjectId",
          model: "subject",
        },
      },
    });

    const subjects = selectedSubjectByUserId.subjects;

    const enrichedSubjects = await Promise.all(
      subjects.map(async (subject) => {
        const classes = await Class.find({
          subjectId: subject._id,
          participants: user._id,
        });

        return {
          ...subject.toJSON(),
          registeredClass: classes.length > 0 ? classes[0].toJSON() : null,
        };
      })
    );

    const response = {
      status: 200,
      message: "success",
      data: {
        ...selectedSubjectByUserId.toJSON(),
        subjects: enrichedSubjects,
      },
    };

    res.send(response);
  } catch (error) {
    next(error);
  }
}

async function updateSelectedSubject(req, res, next) {
  try {
    const { nim, subjects } = req.body;

    const user = await User.findOne({ nim: nim });
    if (!user) throw createError.NotFound("User not found.");

    for (let index = 0; index < subjects.length; index++) {
      const doesSubjectExist = await Subject.findById(subjects[index]);
      if (!doesSubjectExist) throw createError.NotFound("Subject not found");
    }

    const newSelectedSubject = await SelectedSubject.findOneAndUpdate(
      { userId: user.id },
      { $set: { subjects: subjects } },
      {
        returnOriginal: false,
      }
    );

    const response = {
      status: 200,
      message: "updated",
      data: newSelectedSubject,
    };

    res.send(response);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllSelectedSubjects,
  getSelectedSubjectById,
  updateSelectedSubject,
  getSelectedSubjectAndClass,
};
