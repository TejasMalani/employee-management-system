import * as authRepository from '@repositories/auth.repository';
import { hashPassword, comparePassword } from '@utils/password.util';
import { generateAccessToken, generateRefreshToken, getRefreshTokenExpiry } from '@utils/jwt.util';
import { ConflictError, UnauthorizedError } from '@utils/errors';
import { logger } from '@logger/logger';

export const signup = async (data: {
  name: string;
  email: string;
  password: string;
  salary: number;
  department?: string;
}) => {
  const existing = await authRepository.findEmployeeByEmail(data.email);
  if (existing) {
    logger.warn({ email: data.email }, 'Signup attempted with already-registered email');
    throw new ConflictError('Email already registered');
  }

  const hashedPassword = await hashPassword(data.password);
  const employee = await authRepository.createEmployee({
    ...data,
    password: hashedPassword,
  });

  logger.info({ employeeId: employee.id }, 'New employee signed up');

  return { id: employee.id, name: employee.name, email: employee.email };
};

export const login = async (email: string, password: string) => {
  const employee = await authRepository.findEmployeeByEmail(email);
  if (!employee) {
    logger.warn({ email }, 'Login attempt with unregistered email');
    throw new UnauthorizedError('Invalid credentials');
  }

  const isValid = await comparePassword(password, employee.password);
  if (!isValid) {
    logger.warn({ employeeId: employee.id }, 'Login attempt with incorrect password');
    throw new UnauthorizedError('Invalid credentials');
  }

  const accessToken = generateAccessToken({ employeeId: employee.id, role: employee.role });
  const refreshToken = generateRefreshToken();
  await authRepository.saveRefreshToken(employee.id, refreshToken, getRefreshTokenExpiry());

  logger.info({ employeeId: employee.id }, 'Employee logged in successfully');

  return {
    accessToken,
    refreshToken,
    employee: { id: employee.id, name: employee.name, role: employee.role },
  };
};

export const logout = async (refreshToken: string) => {
  await authRepository.deleteRefreshToken(refreshToken);
  logger.info('Employee logged out, refresh token revoked');
};
