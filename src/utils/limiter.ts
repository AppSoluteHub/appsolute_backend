import rateLimit from 'express-rate-limit';


export const userRateLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 3, 
  keyGenerator: (req : any) => req.user.userId,
  message: 'Too many image requests. Please wait a moment.',
});