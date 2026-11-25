const Form = require('../models/Form');
const Submission = require('../models/Submission');
const starterFields = require('../config/starterFields');
const { parseForm } = require('../validators/formSchema');
const { getPagination, buildPage } = require('../utils/pagination');
const { HttpError, catchAsync } = require('../utils/errors');

const LIST_FIELDS = 'name status publishedAt createdAt updatedAt';

function isOwner(user, form) {
  return user?.role === 'admin' && form.createdBy.equals(user.id);
}

function toPublicForm(form) {
  return {
    _id: form._id,
    name: form.name,
    description: form.description,
    fields: form.fields,
  };
}


async function addSubmissionCounts(forms) {
  if (forms.length === 0) return forms;

  const counts = await Submission.aggregate([
    { $match: { formId: { $in: forms.map((form) => form._id) } } },
    { $group: { _id: '$formId', count: { $sum: 1 } } },
  ]);
  const countById = new Map(counts.map((row) => [String(row._id), row.count]));

  return forms.map((form) => ({ ...form, submissionCount: countById.get(String(form._id)) || 0 }));
}


async function findOwnForm(formId, userId) {
  const form = await Form.findOne({ _id: formId, createdBy: userId });
  if (!form) throw new HttpError(404, 'Form not found');
  return form;
}

const createForm = catchAsync(async (req, res) => {
  const data = parseForm({ fields: starterFields, ...req.body });

  const form = await Form.create({
    ...data,
    createdBy: req.user.id,
    publishedAt: data.status === 'published' ? new Date() : undefined,
  });

  res.status(201).json(form);
});

const listForms = catchAsync(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const filter = { createdBy: req.user.id };
  if (['draft', 'published'].includes(req.query.status)) {
    filter.status = req.query.status;
  }

  const [forms, total] = await Promise.all([
    Form.find(filter)
      .select(LIST_FIELDS)
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Form.countDocuments(filter),
  ]);

  const items = await addSubmissionCounts(forms);
  res.json(buildPage(items, total, page, limit));
});

const getForm = catchAsync(async (req, res) => {
  const form = await Form.findById(req.params.id).lean();
  if (!form) throw new HttpError(404, 'Form not found');

  if (isOwner(req.user, form)) return res.json(form);

  if (form.status !== 'published') throw new HttpError(404, 'Form not found');
  res.json(toPublicForm(form));
});

const updateForm = catchAsync(async (req, res) => {
  const data = parseForm(req.body);
  const form = await findOwnForm(req.params.id, req.user.id);

  form.set(data);
  if (data.status === 'published' && !form.publishedAt) {
    form.publishedAt = new Date();
  }
  await form.save();

  res.json(form);
});

const deleteForm = catchAsync(async (req, res) => {
  const form = await findOwnForm(req.params.id, req.user.id);

  await form.deleteOne();
  await Submission.deleteMany({ formId: form._id });

  res.status(204).end();
});

module.exports = { createForm, listForms, getForm, updateForm, deleteForm };
