const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { auth, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', auth, assignmentController.getAssignments);
router.get('/submissions', auth, assignmentController.getSubmissions);
router.get('/:id', auth, assignmentController.getAssignmentById);
router.post('/', auth, requireRole('admin', 'teacher'), assignmentController.createAssignment);
router.put('/:id', auth, requireRole('admin', 'teacher'), assignmentController.updateAssignment);
router.delete('/:id', auth, requireRole('admin', 'teacher'), assignmentController.deleteAssignment);
router.post('/:id/submit', auth, requireRole('student'), upload.array('files', 5), assignmentController.submitAssignment);
router.put('/submissions/:submissionId/grade', auth, requireRole('admin', 'teacher'), assignmentController.gradeSubmission);

module.exports = router;
