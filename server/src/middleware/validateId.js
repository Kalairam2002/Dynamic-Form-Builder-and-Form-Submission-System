const { HttpError } = require('../utils/errors');

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

// Used with router.param so every :id is checked before it reaches a query.
function checkObjectId(req, res, next, value) {
  if (!OBJECT_ID_PATTERN.test(value)) return next(new HttpError(400, 'Invalid id'));
  next();
}

module.exports = { checkObjectId };
