const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const { auth, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', auth, resourceController.getResources);
router.post('/', auth, requireRole('admin', 'teacher'), upload.single('file'), resourceController.createResource);
router.get('/:id/download', auth, resourceController.downloadResource);
router.delete('/:id', auth, requireRole('admin', 'teacher'), resourceController.deleteResource);

module.exports = router;
