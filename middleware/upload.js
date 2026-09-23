const multer = require("multer");
require("dotenv").config();
const path = require("path");

const upload = multer({
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
      return cb(new Error("Only Image Allowed"));
    }
    cb(null, true);
  },
});

module.exports = {
  upload: upload.single("file"),
};
