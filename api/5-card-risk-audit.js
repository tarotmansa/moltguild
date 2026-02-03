const { parseJson, json, requirePost, buildSpread } = require('./_util');

module.exports = async (req, res) => {
  if (!requirePost(req, res)) return;
  const body = await parseJson(req);
  const question = body.question || 'no question provided';
  const result = buildSpread('risk', question);
  json(res, 200, result);
};
