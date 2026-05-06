import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../src/app.js';
import { connect, close, clear } from './setup.js';

beforeAll(async () => { await connect(); });
afterAll(async () => { await close(); });
beforeEach(async () => { await clear(); });

describe('Auth - /api/user', () => {
  describe('POST /api/user/register', () => {
    it('debe registrar un usuario correctamente', async () => {
      const res = await request(app)
        .post('/api/user/register')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.token).toBeDefined();
      expect(res.body.data.user.email).toBe('test@example.com');
    });

    it('debe rechazar email duplicado', async () => {
      await request(app).post('/api/user/register').send({ email: 'dup@example.com', password: 'password123' });
      const res = await request(app).post('/api/user/register').send({ email: 'dup@example.com', password: 'password123' });
      expect(res.status).toBe(409);
    });

    it('debe rechazar contraseña corta', async () => {
      const res = await request(app).post('/api/user/register').send({ email: 'a@b.com', password: '123' });
      expect(res.status).toBe(400);
    });

    it('debe rechazar email inválido', async () => {
      const res = await request(app).post('/api/user/register').send({ email: 'noemail', password: 'password123' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/user/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/user/register').send({ email: 'login@test.com', password: 'password123' });
    });

    it('debe hacer login correctamente', async () => {
      const res = await request(app).post('/api/user/login').send({ email: 'login@test.com', password: 'password123' });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it('debe rechazar contraseña incorrecta', async () => {
      const res = await request(app).post('/api/user/login').send({ email: 'login@test.com', password: 'wrongpass' });
      expect(res.status).toBe(401);
    });

    it('debe rechazar email inexistente', async () => {
      const res = await request(app).post('/api/user/login').send({ email: 'noexist@test.com', password: 'password123' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/user', () => {
    it('debe devolver el usuario autenticado', async () => {
      const registerRes = await request(app).post('/api/user/register').send({ email: 'me@test.com', password: 'password123' });
      const token = registerRes.body.token;

      const res = await request(app).get('/api/user').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('me@test.com');
    });

    it('debe rechazar sin token', async () => {
      const res = await request(app).get('/api/user');
      expect(res.status).toBe(401);
    });
  });
});
