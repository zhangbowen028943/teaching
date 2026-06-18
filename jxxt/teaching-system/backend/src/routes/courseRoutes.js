const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { auth, requireRole } = require('../middleware/auth');

router.get('/', auth, courseController.getCourses);
router.get('/:id', auth, courseController.getCourseById);
router.post('/', auth, requireRole('admin', 'teacher'), courseController.createCourse);
router.put('/:id', auth, requireRole('admin', 'teacher'), courseController.updateCourse);
router.delete('/:id', auth, requireRole('admin', 'teacher'), courseController.deleteCourse);
router.post('/:id/join', auth, requireRole('student'), courseController.joinCourse);
router.post('/:id/leave', auth, requireRole('student'), courseController.leaveCourse);

module.exports = router;
