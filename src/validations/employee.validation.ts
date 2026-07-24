import { z } from 'zod';

export const createEmployeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  salary: z.number().positive('Salary must be a positive number'),
  department: z.string().optional(),
  role: z.enum(['EMPLOYEE', 'MANAGER', 'HR_ADMIN']).optional(),
  managerId: z.number().int().positive().optional(),
});

export const updateEmployeeSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  department: z.string().optional(),
  salary: z.number().positive().optional(),
});

export const listEmployeesQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().optional(),
  department: z.string().optional(),
  sortBy: z.enum(['name', 'email', 'createdAt', 'salary']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const employeeIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Invalid employee ID'),
});
