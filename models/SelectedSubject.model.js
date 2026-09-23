const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SelectedSubjectSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "user" },
  subjects: [
    {
      type: Schema.Types.ObjectId,
      ref: "subject",
    },
    { default: [] },
  ],
});

SelectedSubjectSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;

    return {
      id: ret.id,
      userId: ret.userId,
      subjects: ret.subjects,
    };
  },
});

const SelectedSubject = mongoose.model(
  "selected-subject",
  SelectedSubjectSchema
);
module.exports = SelectedSubject;
