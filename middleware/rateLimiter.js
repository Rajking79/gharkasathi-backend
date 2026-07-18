import rateLimit from 'express-rate-limit';

// Global API Rate Limiter (150 requests per 15 minutes)
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    code: 429,
    message: 'Too many requests from this IP. Please try again after 15 minutes.'
  }
});

// Strict Rate Limiter for OTP Generation (5 SMS attempts per 10 minutes)
export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    code: 429,
    message: 'Too many OTP requests. Please wait 10 minutes before requesting another OTP.'
  }
});

// Strict Rate Limiter for Authentication Attempts
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    code: 429,
    message: 'Too many authentication attempts. Please try again later.'
  }
});
