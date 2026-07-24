import request from 'supertest';
import app from '../app';
import prisma from '@database/prisma';

describe('POST /auth/signup', () => {
  afterEach(async () => {
    await prisma.employee.deleteMany({ where: { email: { contains: 'integrationtest' } } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates a new employee and returns 201', async () => {
    const response = await request(app).post('/auth/signup').send({
      name: 'Integration Test User',
      email: 'integrationtest1@company.com',
      password: 'Test@1234',
      salary: 50000,
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe('integrationtest1@company.com');
    expect(response.body.data.password).toBeUndefined();
  });

  it('returns 409 when email already registered', async () => {
    await request(app).post('/auth/signup').send({
      name: 'Integration Test User',
      email: 'integrationtest2@company.com',
      password: 'Test@1234',
      salary: 50000,
    });

    const response = await request(app).post('/auth/signup').send({
      name: 'Integration Test User Duplicate',
      email: 'integrationtest2@company.com',
      password: 'Test@1234',
      salary: 50000,
    });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
  });

  it('returns 400 for invalid email format', async () => {
    const response = await request(app).post('/auth/signup').send({
      name: 'Integration Test User',
      email: 'not-an-email',
      password: 'Test@1234',
      salary: 50000,
    });

    expect(response.status).toBe(400);
    expect(response.body.details).toBeDefined();
  });
});

describe('POST /auth/login', () => {
  const testEmail = 'integrationtestlogin@company.com';

  beforeAll(async () => {
    await request(app).post('/auth/signup').send({
      name: 'Login Test User',
      email: testEmail,
      password: 'Test@1234',
      salary: 50000,
    });
  });

  afterAll(async () => {
    await prisma.employee.deleteMany({ where: { email: testEmail } });
    await prisma.$disconnect();
  });

  it('logs in successfully with correct credentials', async () => {
    const response = await request(app).post('/auth/login').send({
      email: testEmail,
      password: 'Test@1234',
    });

    expect(response.status).toBe(200);
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.headers['set-cookie']).toBeDefined();
  });

  it('returns 401 with wrong password', async () => {
    const response = await request(app).post('/auth/login').send({
      email: testEmail,
      password: 'WrongPassword',
    });

    expect(response.status).toBe(401);
  });
});
