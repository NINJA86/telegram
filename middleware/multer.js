const multer = require('multer');
const fs = require('fs');
const path = require('path');

exports.multerStorage = (destination, allowType = /jpg|png|jpeg/) => {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, destination);
    },
    filename: (req, file, cb) => {
      const randomName = Date.now();
      const ext = path.extname(file.originalname);
      cb(null, `${randomName}${ext}`);
    },
  });
  const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).replace('.', '');
    if (allowType.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('the format is not permited. only consist jpg png jpeg'));
    }
  };

  return multer({ storage, fileFilter, limits: { fileSize: 512_000_000 } });
};
