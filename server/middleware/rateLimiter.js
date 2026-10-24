/**
 * SoundSphere Production Rate Limiting Middleware
 * Zero-dependency sliding window rate limiter to protect against brute-force & DoS attacks.
 */

const { AppError } = require('./errorHandler');

function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes default
  const maxRequests = options.max || (process.env.NODE_ENV === 'production' ? 100 : 1000);
  const message = options.message || 'Too many requests from this IP, please try again later.';
  const skipFailedRequests = options.skipFailedRequests || false;

  // In-memory request tracking map: IP -> array of timestamps
  const ipHits = new Map();

  // Periodic cleanup interval (every 5 minutes)
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [ip, timestamps] of ipHits.entries()) {
      const valid = timestamps.filter(t => now - t < windowMs);
      if (valid.length === 0) {
        ipHits.delete(ip);
      } else {
        ipHits.set(ip, valid);
      }
    }
  }, 5 * 60 * 1000);

  // Do not hold process alive if this is the only active handle
  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }

  return function rateLimiter(req, res, next) {
    // Optional bypass in test suite unless explicit test header is provided
    if (process.env.NODE_ENV === 'test' && !req.headers['x-test-rate-limit']) {
      return next();
    }

    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    const timestamps = (ipHits.get(ip) || []).filter(t => now - t < windowMs);
    timestamps.push(now);
    ipHits.set(ip, timestamps);

    const remaining = Math.max(0, maxRequests - timestamps.length);
    const resetTime = Math.ceil((timestamps[0] + windowMs) / 1000);

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetTime);

    if (timestamps.length > maxRequests) {
      res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
      return next(new AppError(message, 429));
    }

    next();
  };
}

module.exports = {
  apiLimiter: createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: 'Global API rate limit exceeded. Please try again in 15 minutes.'
  }),
  authLimiter: createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Too many authentication attempts. Account access is temporarily throttled for security.'
  }),
  createRateLimiter
};
