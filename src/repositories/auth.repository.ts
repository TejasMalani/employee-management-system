import prisma from '@database/prisma';

export const findEmployeeByEmail = (email: string) => {
  return prisma.employee.findUnique({ where: { email } });
};

export const createEmployee = (data: {
  name: string;
  email: string;
  password: string;
  role?: 'EMPLOYEE' | 'MANAGER' | 'HR_ADMIN';
  salary: number;
  department?: string;
  managerId?: number;
}) => {
  return prisma.employee.create({ data });
};

export const saveRefreshToken = (employeeId: number, token: string, expiresAt: Date) => {
  return prisma.refreshToken.create({ data: { employeeId, token, expiresAt } });
};

export const findRefreshToken = (token: string) => {
  return prisma.refreshToken.findUnique({ where: { token } });
};

export const deleteRefreshToken = (token: string) => {
  return prisma.refreshToken.delete({ where: { token } });
};
