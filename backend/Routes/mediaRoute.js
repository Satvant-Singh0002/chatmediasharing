
const express = require('express');
const router = express.Router();

const upload = require('../middleware/multer');

const {uploadMedia,getMediaUrl} = require('../controllers/mediaController');

router.post('/upload', upload.single('media'), uploadMedia);
router.get('/url', getMediaUrl);

module.exports = router;
