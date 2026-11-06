/**
 * Role-Based Access Control Middleware
 * Restricts route access to specified roles
 * Suggested Roles: Admin, Project Manager, Team Member
 */

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before checking permissions.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user.role}' is not authorized to perform this operation. Allowed: ${roles.join(', ')}`,
      });
    }

    next();
  };
};
