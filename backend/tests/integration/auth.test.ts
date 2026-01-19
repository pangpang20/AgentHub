import request from 'supertest';
import express from 'express';
import authRouter from '../../src/api/auth';
import { AppError } from '../../src/middleware/error';
import { errorHandler } from '../../src/middleware/error';

describe('Auth API Integration Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/v1/auth', authRouter);
    app.use(errorHandler);
  });

  describe('POST /v1/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        name: 'Test User',
      };

      const response = await request(app)
        .post('/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body.user).not.toHaveProperty('passwordHash');
    });

    it('should return 409 if user already exists', async () => {
      const userData = {
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        name: 'Test User',
      };

      // First registration
      await request(app)
        .post('/v1/auth/register')
        .send(userData)
        .expect(201);

      // Second registration with same email
      const response = await request(app)
        .post('/v1/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body).toHaveProperty('error');
      expect(response.body.code).toBe('USER_EXISTS');
    });

    it('should return 400 if required fields are missing', async () => {
      const userData = {
        email: 'test@example.com',
      };

      const response = await request(app)
        .post('/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.code).toBe('MISSING_FIELDS');
    });
  });

  describe('POST /v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      const userData = {
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        name: 'Test User',
      };

      // Register first
      await request(app)
        .post('/v1/auth/register')
        .send(userData)
        .expect(201);

      // Login
      const response = await request(app)
        .post('/v1/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/v1/auth/login')
        .send({
          email: 'test@example.com',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.code).toBe('MISSING_FIELDS');
    });
  });
});
