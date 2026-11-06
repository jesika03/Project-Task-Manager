/**
 * Authentication Middleware
 * Validates JWT tokens and injects req.user
 */

import jwt from 'jsonwebtoken';
import { dbStore } from '../utils/mockStore.js';
import { JWT_SECRET } from '../config/jwt.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      if (!token || token === 'null' || token === 'undefined') {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, token missing or invalid.',
        });
      }

      const decoded = jwt.verify(token, JWT_SECRET);

      // Find user in store
      const user = dbStore.users.find((u) => u._id === decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'The user belonging to this token no longer exists.',
        });
      }

      // Strip password from req.user
      const { password, ...safeUser } = user;
      req.user = safeUser;
      return next();
    } catch {
      // Token expired, malformed, or invalid signature - return 401 without stderr logging
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed or expired. Please login again.',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided. Please login.',
    });
  }
};
