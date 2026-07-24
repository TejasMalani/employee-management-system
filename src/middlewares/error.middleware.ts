import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import multer from 'multer';
import { AppError } from '@utils/errors';
import { logger } from '@logger/logger';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Multer-specific errors (file too large, wrong field name, etc.)
  if (err instanceof multer.MulterError) {
    logger.warn({ err }, 'Multer upload error');
    return res.status(400).json({
      success: false,
      message: err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 5MB)' : err.message,
    });
  }

  // Custom fileFilter rejection (thrown as a plain Error from our filter)
  if (err.message === 'Only JPEG, PNG, and WEBP images are allowed') {
    logger.warn({ err }, 'File type rejected');
    return res.status(400).json({ success: false, message: err.message });
  }

  // Known, expected application errors
  if (err instanceof AppError) {
    logger.warn({ statusCode: err.statusCode, err }, err.message);
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  // Prisma-specific known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      logger.warn({ err }, 'Prisma unique constraint violation');
      return res.status(409).json({
        success: false,
        message: `Duplicate value for field: ${(err.meta?.target as string[])?.join(', ')}`,
      });
    }
    if (err.code === 'P2025') {
      logger.warn({ err }, 'Prisma record not found');
      return res.status(404).json({
        success: false,
        message: 'Record not found',
      });
    }
  }

  // Zod errors that slipped through without our validate() middleware
  if (err instanceof ZodError) {
    logger.warn({ err }, 'Unvalidated Zod error reached error handler');
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      details: err.issues,
    });
  }

  // Unexpected/unknown errors — programmer bugs
  logger.error({ err }, 'Unexpected error');
  return res.status(500).json({
    success: false,
    message: 'Something went wrong. Please try again later.',
  });
};
