module.exports = (err, req, res, next) => {
  console.error("[ERROR]", {
    method: req.method,
    url: req.originalUrl,
    message: err.message,
    stack: err.stack,
    userId: req.user?.id || "guest",
    role: req.user?.role || "public",
  });

  res.status(500).json({
    error: err.message || "Something went wrong on the server. Please try again.",
  });
};
