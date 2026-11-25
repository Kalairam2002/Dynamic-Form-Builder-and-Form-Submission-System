const xss = require('xss');

const filter = new xss.FilterXSS({
  whiteList: {},
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style'],
});

function cleanText(value) {
  return filter.process(value).trim();
}

module.exports = { cleanText };
