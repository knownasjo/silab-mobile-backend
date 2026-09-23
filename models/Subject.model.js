const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SubjectSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  lecturer: {
    type: String,
    required: true,
  },
  semester: {
    type: Number,
    enum: [1, 2, 3, 4, 5, 6, 7, 8],
    required: true,
  },
  classes: [
    {
      type: Schema.Types.ObjectId,
      ref: "class",
    },
    {
      default: [],
    },
  ],
});

SubjectSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;

    return {
      id: ret.id,
      name: ret.name,
      lecturer: ret.lecturer,
      semester: ret.semester,
      classes: ret.classes,
    };
  },
});

const Subject = mongoose.model("subject", SubjectSchema);
module.exports = Subject;
