const logger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} from ${req.ip}`);
    next(); // Pass control to the next middleware or route
  };
  
  module.exports = logger;
  