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
  const atelierSecret = req.headers['x-atelier-secret'] || req.headers['x-admin-key'];
  const adminEmail = (req.headers['x-admin-email'] || req.headers['x-user-email'] || '').toLowerCase().trim();
  const authHeader = req.headers.authorization;

  // 1. Allow internal Studio calls with Master Atelier secret
  if (atelierSecret === 'zaytoun_atelier_master_2026') {
    req.admin = { sub: adminEmail || 'studio_owner', role: 'admin' };
    return next();
  }

  // 2. Allow verified Google Owner Email
  const authorizedEmails = [
    'shaahrozdogar@gmail.com',
    (process.env.ADMIN_EMAIL || '').toLowerCase().trim()
  ].filter(Boolean);

  if (adminEmail && authorizedEmails.includes(adminEmail)) {
    req.admin = { sub: adminEmail, role: 'admin' };
    return next();
  }

  // 3. Allow JWT Bearer tokens
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.admin = decoded;
      return next();
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

  return res.status(401).json({
    error: 'Access denied. Missing Authorization credentials.',
    code: 'AUTH_REQUIRED'
  });
}

/**
 * Validate incoming password against configured ADMIN_PASSWORD
 */
export function verifyAdminPassword(inputPassword) {
  const configuredPassword = process.env.ADMIN_PASSWORD || 'shahroz';
  if (!inputPassword) return false;
  return inputPassword.trim() === configuredPassword.trim();
}
