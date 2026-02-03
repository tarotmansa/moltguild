const { parseJson, json, requirePost, buildSingle } = require('./_util');

module.exports = async (req, res) => {
  if (!requirePost(req, res)) return;
  const body = await parseJson(req);
  const question = body.question || 'no question provided';
  const result = buildSingle(question);
  json(res, 200, result);
};
