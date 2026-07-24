import { Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { AuthenticatedRequest } from '@middlewares/auth.middleware';
import * as employeeService from '@services/employee.service';

export const createEmployeeHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const employee = await employeeService.createEmployee(req.body);
    res.status(201).json({ success: true, data: employee });
  },
);

export const getEmployeeHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const employee = await employeeService.getEmployeeById(Number(req.params.id));
  res.status(200).json({ success: true, data: employee });
});

export const listEmployeesHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await employeeService.listEmployees({
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      search: req.query.search as string,
      department: req.query.department as string,
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
    });
    res.status(200).json({ success: true, ...result });
  },
);

export const updateEmployeeHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const employee = await employeeService.updateEmployee(Number(req.params.id), req.body);
    res.status(200).json({ success: true, data: employee });
  },
);

export const deleteEmployeeHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    await employeeService.deleteEmployee(Number(req.params.id));
    res.status(200).json({ success: true, message: 'Employee deactivated' });
  },
);

export const uploadProfilePictureHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const employee = await employeeService.uploadProfilePicture(
      Number(req.params.id),
      req.file.buffer,
    );
    res.status(200).json({ success: true, data: employee });
  },
);
