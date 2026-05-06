import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../src/app.js';
import { connect, close, clear } from './setup.js';
import { User } from '../src/models/User.js';
import { Company } from '../src/models/Company.js';

let token;
let companyId;

const setupUser = async () => {
  const registerRes = await request(app)
    .post('/api/user/register')
    .send({ email: 'client-test@example.com', password: 'password123' });
  token = registerRes.body.token;

  // Activar usuario
  await User.findOneAndUpdate({ email: 'client-test@example.com' }, { status: 'active' });

  // Crear compañía
  const company = await Company.create({ owner: registerRes.body.data.user._id, name: 'Test Company' });
  companyId = company._id;
  await User.findByIdAndUpdate(registerRes.body.data.user._id, { company: companyId });
};

beforeAll(async () => { await connect(); });
afterAll(async () => { await close(); });
beforeEach(async () => { await clear(); await setupUser(); });

describe('Clients - /api/client', () => {
  describe('POST /api/client', () => {
    it('debe crear un cliente correctamente', async () => {
      const res = await request(app)
        .post('/api/client')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Cliente Test', cif: 'B12345678', email: 'cliente@test.com' });

      expect(res.status).toBe(201);
      expect(res.body.data.client.name).toBe('Cliente Test');
    });

    it('debe rechazar sin autenticación', async () => {
      const res = await request(app).post('/api/client').send({ name: 'Test' });
      expect(res.status).toBe(401);
    });

    it('debe rechazar nombre vacío', async () => {
      const res = await request(app)
        .post('/api/client')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/client', () => {
    it('debe listar clientes con paginación', async () => {
  await request(app).post('/api/client').set('Authorization', `Bearer ${token}`).send({ name: 'Cliente 1', cif: 'A11111111' });
  await request(app).post('/api/client').set('Authorization', `Bearer ${token}`).send({ name: 'Cliente 2', cif: 'B22222222' });

      const res = await request(app)
        .get('/api/client?page=1&limit=10')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.clients).toHaveLength(2);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.totalItems).toBe(2);
    });

    it('debe filtrar por nombre', async () => {
      await request(app).post('/api/client').set('Authorization', `Bearer ${token}`).send({ name: 'García SA' });
      await request(app).post('/api/client').set('Authorization', `Bearer ${token}`).send({ name: 'López SL' });

      const res = await request(app).get('/api/client?name=García').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.clients).toHaveLength(1);
    });
  });

  describe('PUT /api/client/:id', () => {
    it('debe actualizar un cliente', async () => {
      const createRes = await request(app)
        .post('/api/client')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Original' });

      const clientId = createRes.body.data.client._id;
      const res = await request(app)
        .put(`/api/client/${clientId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Actualizado' });

      expect(res.status).toBe(200);
      expect(res.body.data.client.name).toBe('Actualizado');
    });
  });

  describe('DELETE /api/client/:id', () => {
    it('debe archivar un cliente (soft delete)', async () => {
      const createRes = await request(app)
        .post('/api/client')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Para borrar' });

      const clientId = createRes.body.data.client._id;
      const deleteRes = await request(app)
        .delete(`/api/client/${clientId}?soft=true`)
        .set('Authorization', `Bearer ${token}`);

      expect(deleteRes.status).toBe(200);

      const listRes = await request(app).get('/api/client').set('Authorization', `Bearer ${token}`);
      expect(listRes.body.data.clients).toHaveLength(0);
    });
  });

  describe('PATCH /api/client/:id/restore', () => {
    it('debe restaurar un cliente archivado', async () => {
      const createRes = await request(app)
        .post('/api/client')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Archivado' });

      const clientId = createRes.body.data.client._id;
      await request(app).delete(`/api/client/${clientId}?soft=true`).set('Authorization', `Bearer ${token}`);

      const restoreRes = await request(app)
        .patch(`/api/client/${clientId}/restore`)
        .set('Authorization', `Bearer ${token}`);

      expect(restoreRes.status).toBe(200);
      expect(restoreRes.body.data.client.deleted).toBe(false);
    });
  });
});
