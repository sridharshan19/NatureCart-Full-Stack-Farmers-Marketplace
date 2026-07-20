module.exports = (err, req, res, next) => {
  console.error("[ERROR]", {
    method: req.method,
    url: req.originalUrl,
    message: err.message,
    stack: err.stack,
    userId: req.user?.id || "guest",
    role: req.user?.role || "public",
  });

  const statusCode =
    err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

  res.status(statusCode).json({
    error: err.message || "Something went wrong on the server. Please try again.",
    message: err.message || "Something went wrong on the server. Please try again.",
  });
};

