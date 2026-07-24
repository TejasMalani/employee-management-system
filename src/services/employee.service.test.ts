import * as employeeRepository from '@repositories/employee.repository';
import * as employeeService from '@services/employee.service';
import { NotFoundError } from '@utils/errors';

jest.mock('@repositories/employee.repository');
jest.mock('@utils/cache.util', () => ({
  getCache: jest.fn().mockResolvedValue(null),
  setCache: jest.fn().mockResolvedValue(undefined),
  deleteCache: jest.fn().mockResolvedValue(undefined),
}));

const mockedRepository = employeeRepository as jest.Mocked<typeof employeeRepository>;

describe('employeeService.getEmployeeById', () => {
  it('returns the employee when found', async () => {
    const fakeEmployee = {
      id: 1,
      name: 'Tejas Kulkarni',
      email: 'tejas@company.com',
      role: 'EMPLOYEE',
      isActive: true,
    } as any;

    mockedRepository.findById.mockResolvedValue(fakeEmployee);

    const result = await employeeService.getEmployeeById(1);

    expect(result).toEqual(fakeEmployee);
    expect(mockedRepository.findById).toHaveBeenCalledWith(1);
  });

  it('throws NotFoundError when employee does not exist', async () => {
    mockedRepository.findById.mockResolvedValue(null);

    await expect(employeeService.getEmployeeById(999)).rejects.toThrow(NotFoundError);
    await expect(employeeService.getEmployeeById(999)).rejects.toThrow('Employee not found');
  });
});

describe('employeeService.listEmployees', () => {
  it('applies default pagination when none provided', async () => {
    mockedRepository.findMany.mockResolvedValue([[], 0]);

    const result = await employeeService.listEmployees({});

    expect(mockedRepository.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 10 }),
    );
    expect(result.pagination).toEqual({ page: 1, limit: 10, total: 0, totalPages: 0 });
  });

  it('calculates correct skip value for page 3', async () => {
    mockedRepository.findMany.mockResolvedValue([[], 25]);

    await employeeService.listEmployees({ page: 3, limit: 10 });

    expect(mockedRepository.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10 }),
    );
  });
});

describe('employeeService.deleteEmployee', () => {
  it('throws NotFoundError instead of calling softDelete when employee missing', async () => {
    mockedRepository.findById.mockResolvedValue(null);

    await expect(employeeService.deleteEmployee(999)).rejects.toThrow(NotFoundError);
    expect(mockedRepository.softDelete).not.toHaveBeenCalled();
  });
});
