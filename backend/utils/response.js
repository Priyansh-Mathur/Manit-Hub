const success = (res, data = null, message = "Success", status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
};

const error = (
  res,
  message = "Something went wrong",
  status = 400,
  extra = null,
  code = null
) => {
  return res.status(status).json({
    success: false,
    message,
    // Machine-readable code (e.g. "ACCOUNT_SUSPENDED") so the client can react
    // reliably instead of string-matching the human message.
    ...(code && { code }),
    ...(process.env.NODE_ENV !== "production" && extra && { extra }),
  });
};

module.exports = { success, error };
