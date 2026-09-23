const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ModuleSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  file: {
    type: Buffer,
    required: true,
  },
});

ModuleSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;

    return {
      id: ret.id,
      name: ret.name,
      file: ret.file,
    };
  },
});

const Module = mongoose.model("module", ModuleSchema);
module.exports = Module;
