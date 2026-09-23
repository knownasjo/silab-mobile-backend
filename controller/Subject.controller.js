const Subject = require("../models/Subject.model");
const { subjectSchema } = require("../helpers/validation_schema");
const createError = require("http-errors");

async function getAllSubjects(req, res, next) {
  try {
    const { semester } = req.query;

    let subjects;

    if (semester) {
      subjects = await Subject.find({ semester: semester }).populate("classes");
    } else {
      subjects = await Subject.find().populate("classes");
    }

    const response = {
      status: 200,
      message: "success",
      data: subjects,
    };

    res.send(response);
  } catch (error) {
    next(error);
  }
}

async function getSubjectsDetails(req, res, next) {
  try {
    const { subjects } = req.body;

    if (!Array.isArray(subjects)) {
      return res.status(400).json({
        status: 400,
        message: "subjects should be an array",
      });
    }

    const subjectsDetails = await Promise.all(
      subjects.map(async (subjectId) => {
        const subjectDetails = await Subject.findById(subjectId).populate(
          "classes"
        );
        if (!subjectDetails) {
          throw new Error(`Subject with id ${subjectId} not found`);
        }
        return subjectDetails.toJSON();
      })
    );

    const response = {
      status: 200,
      message: "success",
      data: subjectsDetails,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

async function getSubject(req, res, next) {
  try {
    const { id } = req.params;

    const subject = await Subject.findById(id).populate("classes");

    const response = {
      status: 200,
      message: "success",
      data: subject,
    };

    res.send(response);
  } catch (error) {
    next(error);
  }
}

async function addSubject(req, res, next) {
  try {
    const result = await subjectSchema.validateAsync(req.body);
    const doesExist = await Subject.findOne({ name: result.name });
    if (doesExist)
      throw createError.Conflict(`${result.name} is already added`);

    const subject = new Subject(result);
    const savedSubject = await subject.save();

    const response = {
      status: 201,
      message: `${savedSubject.name} added.`,
    };

    res.send(response);
  } catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

async function updateSubject(req, res, next) {
  try {
    const { id } = req.params;
    const filter = { _id: id };
    const data = req.body;

    const subject = await Subject.findOneAndUpdate(
      filter,
      { $set: data },
      {
        returnOriginal: false,
      }
    );
    if (!subject) throw createError.NotFound("Subject not Found");

    const response = {
      status: 201,
      message: "updated",
      data: subject,
    };

    res.send(response);
  } catch (error) {
    next(error);
  }
}

async function deleteSubject(req, res, next) {
  try {
    const { id } = req.params;

    const subject = await Subject.findById(id);
    if (!subject) throw createError.NotFound("Subject not found");

    await Subject.deleteOne({ _id: id });

    const response = {
      status: 200,
      message: "deleted",
    };

    res.send(response);
  } catch (error) {
    next(error);
  }
}

async function getSubjectsBySemesters(req, res, next) {
  try {
    const { semester } = req.query;
    let subjects;

    if (semester) {
      subjects = await Subject.find({ semester: semester }).populate("classes");

      subjects = [
        {
          _id: Number(semester),
          subjects: subjects.map((subject) => ({
            id: subject._id,
            name: subject.name,
            lecturer: subject.lecturer,
            classes: subject.classes.map((classItem) => ({
              _id: classItem._id,
              subjectId: classItem.subject,
              name: classItem.name,
              day: classItem.day,
              startAt: classItem.startAt,
              endAt: classItem.endAt,
              quota: classItem.quota,
              isFull: classItem.isFull,
              assistants: classItem.assistants,
              participants: classItem.participants,
              learningModule: classItem.learningModule,
              __v: classItem.__v,
              ruang: classItem.ruang,
            })),
          })),
        },
      ];
    } else {
      subjects = await Subject.aggregate([
        {
          $lookup: {
            from: "classes",
            localField: "classes",
            foreignField: "_id",
            as: "classes",
          },
        },
        {
          $group: {
            _id: "$semester",
            subjects: {
              $push: {
                id: "$_id",
                name: "$name",
                lecturer: "$lecturer",
                classes: "$classes",
              },
            },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);
    }

    const response = {
      status: 200,
      message: "success",
      data: subjects,
    };

    res.send(response);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllSubjects,
  addSubject,
  getSubject,
  updateSubject,
  deleteSubject,
  getSubjectsDetails,
  getSubjectsBySemesters,
};
