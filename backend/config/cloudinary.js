const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // PDFs need resource_type "raw" or "auto"
    const isImage = ['image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype);
    return {
      folder: "campus_print",
      resource_type: isImage ? "image" : "raw",
      allowed_formats: ["jpg", "png", "jpeg", "pdf"],
      format: file.mimetype === "application/pdf" ? "pdf" : undefined,
    };
  },
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
});

module.exports = { cloudinary, upload };
