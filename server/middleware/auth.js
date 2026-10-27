import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'zaytoun_default_secret_key_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

/**
 * Generate an expiring JWT token for the authenticated admin
 */
export function generateAdminToken(adminIdentifier = 'shahroz') {
  return jwt.sign(
    {
      sub: adminIdentifier,
      role: 'admin',
      iss: 'zaytoun-atelier'
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN
    }
  );
}

/**
 * Verify JWT Token Middleware
 * Protects admin endpoints from unauthorized access or expired sessions
 */
export function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Access denied. Missing Authorization Bearer token.',
      code: 'AUTH_REQUIRED'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Admin session expired. Please log in again.',
        code: 'TOKEN_EXPIRED'
      });
    }
    return res.status(403).json({
      error: 'Invalid or forged authentication token.',
      code: 'INVALID_TOKEN'
    });
  }
}

/**
 * Validate incoming password against configured ADMIN_PASSWORD
 */
export function verifyAdminPassword(inputPassword) {
  const configuredPassword = process.env.ADMIN_PASSWORD || 'shahroz';
  if (!inputPassword) return false;
  return inputPassword.trim() === configuredPassword.trim();
}
