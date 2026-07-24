import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@middlewares/auth.middleware';

export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      const error: any = new Error('Not authenticated');
      error.statusCode = 401;
      return next(error);
    }

    if (!allowedRoles.includes(req.user.role)) {
      const error: any = new Error('You do not have permission to perform this action');
      error.statusCode = 403;
      return next(error);
    }

    next();
  };
};
