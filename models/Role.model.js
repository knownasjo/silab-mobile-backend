const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RoleSchema = new Schema({
  name: {
    type: String,
    required: true,
    enum: ["mahasiswa", "dosen", "laboran", "asisten"],
  },
  desc: {
    type: String,
    required: true,
  },
});

const Role = mongoose.model("role", RoleSchema);
module.exports = Role;
