const express = require('express');
const { createRoom } = require('../Controller/Room');
const router = express.Router();

const upload = require('../middleware/multer');
const uploader = upload.multerStorage('public/rooms');
router.post('/', uploader.single('image'), createRoom);
module.exports = router;
