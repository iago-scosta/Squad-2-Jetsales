function sendData(res, data, statusCode = 200) {
  return res.status(statusCode).json({ data });
}

function sendList(res, items, statusCode = 200) {
  return res.status(statusCode).json({
    data: items,
    total: items.length,
  });
}

module.exports = {
  sendData,
  sendList,
};
