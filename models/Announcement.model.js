const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AnnouncementSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["asprak", "praktikum", "inhal", "pengumuman"],
  },
  desc: {
    type: String,
    required: true,
  },
  detail: {
    type: String,
    required: false,
  },
  posterUrl: {
    type: String,
    required: false,
  },
  postDate: {
    type: Date,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  isPosted: {
    type: Boolean,
    required: true,
    default: false,
  },
});

AnnouncementSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;

    return {
      id: ret.id,
      title: ret.title,
      type: ret.type,
      desc: ret.desc,
      detail: ret.detail,
      posterUrl: ret.posterUrl,
      postDate: ret.postDate,
      dueDate: ret.dueDate,
      isPosted: ret.isPosted,
    };
  },
});

const Announcement = mongoose.model("announcement", AnnouncementSchema);
module.exports = Announcement;
