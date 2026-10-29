const express = require('express');
const router = express.Router();

const groupController = require('../controllers/groupController');

// POST /group/createGroup
router.post('/createGroup', groupController.createGroup);

// GET /group/getMyGroups/:userId
router.get('/getMyGroups/:userId', groupController.getMyGroups);

module.exports = router;