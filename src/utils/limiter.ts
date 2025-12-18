import rateLimit from 'express-rate-limit';

export const globalRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  standardHeaders: true, 
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again in a minute.',
  },
});


export const userRateLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 3, 
  keyGenerator: (req : any) => req.user.userId,
  message: 'Too many image requests. Please wait a moment.',
});