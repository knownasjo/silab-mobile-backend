const Joi = require("@hapi/joi");

const registerSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  fullname: Joi.string().required(),
  nim: Joi.string().required(),
  password: Joi.string().min(8).required(),
  repeatPassword: Joi.ref("password"),
  phoneNumber: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(8).required(),
});

const subjectSchema = Joi.object({
  name: Joi.string().required(),
  lecturer: Joi.string().required(),
  classes: Joi.any(),
  semester: Joi.number().required(),
});

const classSchema = Joi.object({
  subjectId: Joi.string().required(),
  name: Joi.string().required(),
  day: Joi.string().required(),
  startAt: Joi.string().required(),
  endAt: Joi.string().required(),
  ruang: Joi.string().required(),
  assistants: Joi.any(),
  quota: Joi.number().required(),
  isFull: Joi.boolean(),
  participants: Joi.any(),
  learningModule: Joi.any(),
});

const roleSchema = Joi.object({
  name: Joi.string().required().lowercase(),
  desc: Joi.string().required(),
});

const presenceSchema = Joi.object({
  classId: Joi.string().required(),
  date: Joi.string().required(),
  payload: Joi.string().required(),
  participants: Joi.any(),
});

const resetPasswordSchema = Joi.object({
  userId: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
  repeatNewPassword: Joi.ref("newPassword"),
});

module.exports = {
  registerSchema,
  loginSchema,
  subjectSchema,
  classSchema,
  roleSchema,
  presenceSchema,
  resetPasswordSchema,
};
