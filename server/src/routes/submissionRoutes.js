const express = require('express');
const { adminOnly } = require('../middleware/auth');
const { checkObjectId } = require('../middleware/validateId');
const { submissionLimiter } = require('../middleware/rateLimit');
const {
  createSubmission,
  listSubmissions,
  getSubmission,
  deleteSubmission,
} = require('../controllers/submissionController');

// mergeParams gives access to :formId from the parent forms router.
const router = express.Router({ mergeParams: true });

router.param('id', checkObjectId);

router.route('/').post(submissionLimiter, createSubmission).get(adminOnly, listSubmissions);

router.route('/:id').get(adminOnly, getSubmission).delete(adminOnly, deleteSubmission);

module.exports = router;
