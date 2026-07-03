const errorHandler = (err, req, res, next) => {
  console.log(err);

  const status = err.statusCode || err.status || 500;

  // 4xx messages are written for users and safe to show. 5xx messages can
  // leak internals (driver errors, file paths), so hide them in production.
  const message =
    status >= 500 && process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message || "Internal Server Error";

  return res.status(status).json({ message });
};

module.exports = errorHandler;
