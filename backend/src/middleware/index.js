const asyncHandler = require('./asyncHandler');
const { errorHandler, notFound } = require('./errorHandler');

module.exports = {
  asyncHandler,
  errorHandler,
  notFound
};
