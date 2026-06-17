const errorHandler = (err, req, res, next) => {
  console.log(err);

  const status = err.statusCode || err.status || 500;
  const message = err.message || "Internal Server Error";

  return res.status(status).json({ message });
};

module.exports = errorHandler;
