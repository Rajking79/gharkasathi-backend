export const auditLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const userId = req.user ? req.user.id : 'anonymous';
    const role = req.user ? req.user.role : 'guest';
    const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';

    console.log(`[AUDIT] ${new Date().toISOString()} | ${req.method} ${req.originalUrl} | Status: ${res.statusCode} | User: ${userId} (${role}) | IP: ${ip} | ${duration}ms`);
  });

  next();
};
