const express = require('express');
const { optionalAuth, adminOnly } = require('../middleware/auth');
const { checkObjectId } = require('../middleware/validateId');
const submissionRoutes = require('./submissionRoutes');
const {
  createForm,
  listForms,
  getForm,
  updateForm,
  deleteForm,
} = require('../controllers/formController');

const router = express.Router();

router.param('id', checkObjectId);
router.param('formId', checkObjectId);

router.route('/').post(adminOnly, createForm).get(adminOnly, listForms);

router
  .route('/:id')
  .get(optionalAuth, getForm)
  .put(adminOnly, updateForm)
  .delete(adminOnly, deleteForm);

router.use('/:formId/submissions', submissionRoutes);

module.exports = router;
