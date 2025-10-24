const express = require('express');
const router = express.Router();
const { getClassrooms, getClassroomById } = require('../controllers/classroomController');

router.get('/', getClassrooms);
router.get('/:id', getClassroomById);

module.exports = router;
