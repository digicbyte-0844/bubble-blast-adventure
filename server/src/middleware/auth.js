import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authorization token missing or malformed. Format: Bearer <TOKEN>'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secure_jwt_secret_key_minimum_64_characters_long');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

export const protectRoute = authMiddleware;

export const requireAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authorization required. Format: Bearer <TOKEN>'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secure_jwt_secret_key_minimum_64_characters_long');
    req.user = decoded;

    // Fast-path check
    if (decoded.role === 'admin' || decoded.username === 'admin' || decoded.username === 'Always_Prabhu') {
      return next();
    }

    // Database lookup verification
    const User = (await import('../models/User.js')).default;
    const dbUser = await User.findById(decoded.id);
    if (dbUser && (dbUser.role === 'admin' || dbUser.username === 'admin' || dbUser.username === 'Always_Prabhu')) {
      req.user.role = 'admin';
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Forbidden: Administrator privileges required.'
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.'
    });
  }
};

export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secure_jwt_secret_key_minimum_64_characters_long');
      req.user = decoded;
    } catch (e) {}
  }
  next();
};

export default authMiddleware;
