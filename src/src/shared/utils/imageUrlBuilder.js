const cloudinary = require("../../config/cloudinary");

exports.buildImageUrl = (publicId, options = {}) => {
  if (!publicId) return null;

  return cloudinary.url(publicId, {
    secure: true,
    ...options,
  });
};
