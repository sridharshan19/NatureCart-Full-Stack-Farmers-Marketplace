module.exports = (req, res, next) => {
  const startedAt = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    const userId = req.user?.id || "guest";
    const role = req.user?.role || "public";

    console.log(
      `[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms user=${userId} role=${role}`
    );
  });

  next();
};
