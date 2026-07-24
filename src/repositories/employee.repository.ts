import prisma from '@database/prisma';
import { Prisma } from '@prisma/client';

const EMPLOYEE_SAFE_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  department: true,
  salary: true,
  isActive: true,
  profilePictureUrl: true,
  managerId: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const create = (data: Prisma.EmployeeCreateInput) => {
  return prisma.employee.create({ data, select: EMPLOYEE_SAFE_SELECT });
};

export const findById = (id: number) => {
  return prisma.employee.findFirst({ where: { id, isActive: true }, select: EMPLOYEE_SAFE_SELECT });
};

export const findMany = (params: {
  skip: number;
  take: number;
  search?: string;
  department?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}) => {
  const { skip, take, search, department, sortBy, sortOrder } = params;

  const where: Prisma.EmployeeWhereInput = {
    isActive: true,
    ...(department && { department }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  return Promise.all([
    prisma.employee.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
      select: EMPLOYEE_SAFE_SELECT,
    }),
    prisma.employee.count({ where }),
  ]);
};

export const update = (id: number, data: Prisma.EmployeeUpdateInput) => {
  return prisma.employee.update({ where: { id }, data, select: EMPLOYEE_SAFE_SELECT });
};

export const softDelete = (id: number) => {
  return prisma.employee.update({
    where: { id },
    data: { isActive: false },
    select: EMPLOYEE_SAFE_SELECT,
  });
};

export const updateProfilePicture = (id: number, url: string) => {
  return prisma.employee.update({
    where: { id },
    data: { profilePictureUrl: url },
    select: EMPLOYEE_SAFE_SELECT,
  });
};
