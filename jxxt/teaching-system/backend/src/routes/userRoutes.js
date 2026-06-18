const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, requireRole } = require('../middleware/auth');

router.get('/', auth, userController.getUsers);
router.get('/teachers', auth, userController.getTeachers);
router.get('/students', auth, userController.getStudents);
router.get('/:id', auth, userController.getUserById);
router.post('/', auth, requireRole('admin'), userController.createUser);
router.put('/:id', auth, userController.updateUser);
router.delete('/:id', auth, requireRole('admin'), userController.deleteUser);

module.exports = router;
