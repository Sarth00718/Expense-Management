// Role-based authorization middleware

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authorized, please login'
        }
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Required role: ${roles.join(' or ')}`
        }
      });
    }

    next();
  };
};

// Check if user can manage another user (admin or manager managing their reports)
export const canManageUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    // Admin can manage anyone
    if (currentUser.role === 'admin') {
      return next();
    }

    // Manager can only manage their direct reports
    if (currentUser.role === 'manager') {
      const User = (await import('../models/User.js')).default;
      const targetUser = await User.findById(id);

      if (!targetUser) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'User not found'
          }
        });
      }

      if (targetUser.managerId && targetUser.managerId.toString() === currentUser._id.toString()) {
        return next();
      }
    }

    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'You do not have permission to manage this user'
      }
    });
  } catch (error) {
    next(error);
  }
};
