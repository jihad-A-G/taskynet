import { Request, Response, NextFunction } from 'express';
import { Role } from '../models';

interface AuthRequest extends Request {
  user?: any;
}

export const requireRole = (...allowedRoles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Populate role information if not already populated
      const userWithRole = await req.user.populate('roleId');
      const userRole = userWithRole.roleId?.name;

      if (!userRole) {
        return res.status(403).json({ error: 'User role not found' });
      }

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ 
          error: `Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${userRole}` 
        });
      }

      return next();
    } catch (error: any) {
      return res.status(500).json({ error: 'Role verification error' });
    }
  };
};

// Middleware specifically for admin-only routes
export const requireAdmin = requireRole('Admin');

// Middleware for admin and manager roles
export const requireAdminOrManager = requireRole('Admin', 'Manager');

// Middleware for technician access
export const requireTechnician = requireRole('Admin', 'Manager', 'Technician');

// Middleware for collector access
export const requireCollector = requireRole('Admin', 'Manager', 'Collector');
