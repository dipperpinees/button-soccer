const cloudinary =  require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const cloundaryConfig = cloudinary.config({
    cloud_name: process.env.cloudname,
    api_key: process.env.apikey,
    api_secret: process.env.apisecret,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "DEV",
    },
});

module.exports = {storage, cloundaryConfig}
