import * as employeeRepository from '@repositories/employee.repository';
import { NotFoundError } from '@utils/errors';
import { hashPassword } from '@utils/password.util';
import { getCache, setCache, deleteCache } from '@utils/cache.util';
import { logger } from '@logger/logger';
import { uploadImageBuffer } from '@utils/upload.util';

const EMPLOYEE_LIST_CACHE_PREFIX = 'employees:list:';
const EMPLOYEE_LIST_TTL_SECONDS = 60;

export const createEmployee = async (data: {
  name: string;
  email: string;
  password: string;
  salary: number;
  department?: string;
  role?: 'EMPLOYEE' | 'MANAGER' | 'HR_ADMIN';
  managerId?: number;
}) => {
  const hashedPassword = await hashPassword(data.password);
  const employee = await employeeRepository.create({ ...data, password: hashedPassword });
  logger.info({ employeeId: employee.id }, 'Employee record created by HR admin');

  // Invalidate all cached employee list pages — the new employee could appear in any of them
  await deleteCache(`${EMPLOYEE_LIST_CACHE_PREFIX}*`);

  return employee;
};

export const getEmployeeById = async (id: number) => {
  const employee = await employeeRepository.findById(id);
  if (!employee) {
    logger.warn({ id }, 'Employee lookup failed — not found');
    throw new NotFoundError('Employee');
  }
  return employee;
};

export const listEmployees = async (query: {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  const page = query.page && query.page > 0 ? query.page : 1;
  const limit = query.limit && query.limit > 0 ? query.limit : 10;
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder || 'desc';

  const cacheKey = `${EMPLOYEE_LIST_CACHE_PREFIX}${JSON.stringify({
    page,
    limit,
    search: query.search || '',
    department: query.department || '',
    sortBy,
    sortOrder,
  })}`;

  const cached = await getCache<{
    data: unknown[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>(cacheKey);

  if (cached) {
    logger.debug({ cacheKey }, 'Employee list served from cache');
    return cached;
  }

  const [employees, total] = await employeeRepository.findMany({
    skip: (page - 1) * limit,
    take: limit,
    search: query.search,
    department: query.department,
    sortBy,
    sortOrder,
  });

  const result = {
    data: employees,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };

  await setCache(cacheKey, result, EMPLOYEE_LIST_TTL_SECONDS);
  logger.debug({ cacheKey }, 'Employee list served from DB, cached');

  return result;
};

export const updateEmployee = async (
  id: number,
  data: Partial<{ name: string; department: string; salary: number }>,
) => {
  await getEmployeeById(id);
  const updated = await employeeRepository.update(id, data);
  logger.info({ employeeId: id }, 'Employee record updated');

  await deleteCache(`${EMPLOYEE_LIST_CACHE_PREFIX}*`);

  return updated;
};

export const deleteEmployee = async (id: number) => {
  await getEmployeeById(id);
  await employeeRepository.softDelete(id);
  logger.info({ employeeId: id }, 'Employee soft-deleted');

  await deleteCache(`${EMPLOYEE_LIST_CACHE_PREFIX}*`);
};

export const uploadProfilePicture = async (employeeId: number, fileBuffer: Buffer) => {
  await getEmployeeById(employeeId); // throws 404 if not found

  const imageUrl = await uploadImageBuffer(fileBuffer, 'employee-profile-pictures');
  const updated = await employeeRepository.updateProfilePicture(employeeId, imageUrl);

  await deleteCache(`${EMPLOYEE_LIST_CACHE_PREFIX}*`);
  logger.info({ employeeId }, 'Profile picture uploaded');

  return updated;
};
