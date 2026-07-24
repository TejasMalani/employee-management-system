import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '@utils/jwt.util';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const error: any = new Error('No token provided');
    error.statusCode = 401;
    return next(error);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    const error: any = new Error('Invalid or expired token');
    error.statusCode = 401;
    next(error);
  }
};
