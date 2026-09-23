const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ClassSchema = new Schema({
  subjectId: {
    type: Schema.Types.ObjectId,
    ref: "subject",
    required: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  day: {
    type: String,
    required: true,
  },
  startAt: {
    type: String,
    required: true,
  },
  endAt: {
    type: String,
    required: true,
  },
  ruang: {
    type: String,
    required: true,
  },
  assistants: [
    {
      type: Schema.Types.ObjectId,
      ref: "user",
      sparse: true,
    },
    { default: [] },
  ],
  quota: {
    type: Number,
    required: true,
  },
  isFull: {
    type: Boolean,
    required: true,
    default: false,
  },
  participants: [
    {
      type: Schema.Types.ObjectId,
      ref: "user",
      sparse: true,
    },
    {
      default: [],
    },
  ],
  learningModule: [
    {
      type: Schema.Types.ObjectId,
      ref: "module",
    },
    {
      default: [],
    },
  ],
});

ClassSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;

    return {
      id: ret.id,
      subject: ret.subjectId,
      name: ret.name,
      quota: ret.quota,
      isFull: ret.isFull,
      day: ret.day,
      startAt: ret.startAt,
      endAt: ret.endAt,
      ruang: ret.ruang,
      participants: ret.participants,
      learningModule: ret.learningModule,
    };
  },
});

const Class = mongoose.model("class", ClassSchema);
module.exports = Class;
