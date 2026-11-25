const Form = require('../models/Form');
const Submission = require('../models/Submission');
const { validateSubmission } = require('../validators/submissionValidator');
const { getPagination, buildPage } = require('../utils/pagination');
const { HttpError, catchAsync } = require('../utils/errors');

async function checkFormOwner(formId, userId) {
  const exists = await Form.exists({ _id: formId, createdBy: userId });
  if (!exists) throw new HttpError(404, 'Form not found');
}

const createSubmission = catchAsync(async (req, res) => {
  const form = await Form.findById(req.params.formId).select('status fields').lean();
  if (!form || form.status !== 'published') {
    throw new HttpError(404, 'This form is not available');
  }

  const data = validateSubmission(form, req.body);
  const submission = await Submission.create({
    formId: form._id,
    data,
  });

  res.status(201).json({ _id: submission._id, createdAt: submission.createdAt });
});

const listSubmissions = catchAsync(async (req, res) => {
  const { formId } = req.params;
  await checkFormOwner(formId, req.user.id);

  const { page, limit, skip } = getPagination(req.query);
  const filter = { formId };

  const [items, total] = await Promise.all([
    Submission.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit).lean(),
    Submission.countDocuments(filter),
  ]);

  res.json(buildPage(items, total, page, limit));
});

const getSubmission = catchAsync(async (req, res) => {
  const { formId, id } = req.params;
  await checkFormOwner(formId, req.user.id);

  const submission = await Submission.findOne({ _id: id, formId }).lean();
  if (!submission) throw new HttpError(404, 'Submission not found');

  res.json(submission);
});

const deleteSubmission = catchAsync(async (req, res) => {
  const { formId, id } = req.params;
  await checkFormOwner(formId, req.user.id);

  const deleted = await Submission.findOneAndDelete({ _id: id, formId });
  if (!deleted) throw new HttpError(404, 'Submission not found');

  res.status(204).end();
});

module.exports = { createSubmission, listSubmissions, getSubmission, deleteSubmission };
