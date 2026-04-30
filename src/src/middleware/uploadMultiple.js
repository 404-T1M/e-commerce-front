const multer = require("multer");

const storage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only images allowed"), false);
};

exports.uploadMultiple = (fieldName, max = 5) =>
  multer({ storage, fileFilter: imageFilter }).array(fieldName, max);
