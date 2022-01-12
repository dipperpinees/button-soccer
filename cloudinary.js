const cloudinary =  require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const cloundaryConfig = cloudinary.config({
    cloud_name: "uethehe",
    api_key: "351837916728316",
    api_secret: "23FUPTzHqtBTfbK5ugYBpHq5Q3U",
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "DEV",
    },
});

module.exports = {storage, cloundaryConfig}