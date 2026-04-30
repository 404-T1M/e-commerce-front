const cloudinary = require("../../config/cloudinary");
class ImageService {
  static async uploadSingle({ file, folder }) {
    return this.#upload(file.buffer, folder);
  }

  static async uploadMany({ files, folder }) {
    return Promise.all(files.map((file) => this.#upload(file.buffer, folder)));
  }

  static async delete(publicId) {
    return cloudinary.uploader.destroy(publicId);
  }

  static async deleteMany(publicIds = []) {
    return Promise.all(publicIds.map(this.delete));
  }

  static #upload(buffer, folder) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: "image",
            transformation: [{ quality: "auto", fetch_format: "auto" }],
          },
          (err, res) => {
            if (err) return reject(err);
            resolve({
              publicId: res.public_id,
              url: res.secure_url,
              size: res.bytes,
            });
          },
        )
        .end(buffer);
    });
  }
}

module.exports = ImageService;
