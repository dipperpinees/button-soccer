const cloudinary =  require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const cloundaryConfig = cloudinary.config({
    cloud_name: process.env.CLOUDNAME,
    api_key: process.env.APIKEY,
    api_secret: process.env.APISECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "DEV",
    },
});

module.exports = {storage, cloundaryConfig}
