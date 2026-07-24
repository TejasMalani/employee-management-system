import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

type ValidationTarget = 'body' | 'query' | 'params';

export const validate = (schema: ZodSchema, target: ValidationTarget = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      const error: any = new Error('Validation failed');
      error.statusCode = 400;
      error.details = errors;
      return next(error);
    }

    if (target === 'query') {
      // req.query is a getter-only property in Express 5 — mutate in place instead of reassigning
      Object.assign(req.query, result.data);
    } else {
      req[target] = result.data;
    }

    next();
  };
};
