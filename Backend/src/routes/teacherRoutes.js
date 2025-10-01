const express = require('express');
const router = express.Router();
const { createTeacher } = require('../controllers/teacherController');

router.post('/create', createTeacher);

module.exports = router;