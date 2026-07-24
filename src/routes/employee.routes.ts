import { Router } from 'express';
import { authenticate } from '@middlewares/auth.middleware';
import { authorize } from '@middlewares/rbac.middleware';
import { validate } from '@middlewares/validate.middleware';
import { upload } from '@config/multer.config';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  listEmployeesQuerySchema,
  employeeIdParamSchema,
} from '@validations/employee.validation';
import {
  createEmployeeHandler,
  getEmployeeHandler,
  listEmployeesHandler,
  updateEmployeeHandler,
  deleteEmployeeHandler,
  uploadProfilePictureHandler,
} from '@controllers/employee.controller';

const router = Router();

/**
 * @openapi
 * /employees:
 *   post:
 *     summary: Create a new employee (HR_ADMIN only)
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, salary]
 *             properties:
 *               name:
 *                 type: string
 *                 example: New Employee
 *               email:
 *                 type: string
 *                 example: newemployee@company.com
 *               password:
 *                 type: string
 *                 example: Test@1234
 *               salary:
 *                 type: number
 *                 example: 60000
 *               department:
 *                 type: string
 *                 example: Sales
 *               role:
 *                 type: string
 *                 enum: [EMPLOYEE, MANAGER, HR_ADMIN]
 *     responses:
 *       201:
 *         description: Employee created
 *       400:
 *         description: Validation failed
 *       403:
 *         description: Forbidden — requires HR_ADMIN role
 */
router.post(
  '/',
  authenticate,
  authorize('HR_ADMIN'),
  validate(createEmployeeSchema, 'body'),
  createEmployeeHandler,
);

/**
 * @openapi
 * /employees:
 *   get:
 *     summary: List employees with pagination, search, filter, and sort
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, email, createdAt, salary]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Paginated list of employees
 *       403:
 *         description: Forbidden — requires HR_ADMIN or MANAGER role
 */
router.get(
  '/',
  authenticate,
  authorize('HR_ADMIN', 'MANAGER'),
  validate(listEmployeesQuerySchema, 'query'),
  listEmployeesHandler,
);

/**
 * @openapi
 * /employees/{id}:
 *   get:
 *     summary: Get a single employee by ID
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Employee found
 *       404:
 *         description: Employee not found
 */
router.get('/:id', authenticate, validate(employeeIdParamSchema, 'params'), getEmployeeHandler);

/**
 * @openapi
 * /employees/{id}:
 *   patch:
 *     summary: Update an employee (HR_ADMIN only)
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               department:
 *                 type: string
 *               salary:
 *                 type: number
 *     responses:
 *       200:
 *         description: Employee updated
 *       403:
 *         description: Forbidden — requires HR_ADMIN role
 *       404:
 *         description: Employee not found
 */
router.patch(
  '/:id',
  authenticate,
  authorize('HR_ADMIN'),
  validate(employeeIdParamSchema, 'params'),
  validate(updateEmployeeSchema, 'body'),
  updateEmployeeHandler,
);

/**
 * @openapi
 * /employees/{id}:
 *   delete:
 *     summary: Soft-delete (deactivate) an employee (HR_ADMIN only)
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Employee deactivated
 *       403:
 *         description: Forbidden — requires HR_ADMIN role
 *       404:
 *         description: Employee not found
 */
router.delete(
  '/:id',
  authenticate,
  authorize('HR_ADMIN'),
  validate(employeeIdParamSchema, 'params'),
  deleteEmployeeHandler,
);

/**
 * @openapi
 * /employees/{id}/profile-picture:
 *   post:
 *     summary: Upload an employee's profile picture
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile picture uploaded
 *       400:
 *         description: Invalid file type, too large, or no file uploaded
 *       404:
 *         description: Employee not found
 */
router.post(
  '/:id/profile-picture',
  authenticate,
  validate(employeeIdParamSchema, 'params'),
  upload.single('profilePicture'),
  uploadProfilePictureHandler,
);

export default router;
