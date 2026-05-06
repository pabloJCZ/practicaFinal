import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../src/app.js';
import { connect, close, clear } from './setup.js';
import { User } from '../src/models/User.js';
import { Company } from '../src/models/Company.js';

let token;
let clientId;

const setupUser = async () => {
  const registerRes = await request(app)
    .post('/api/user/register')
    .send({ email: 'project-test@example.com', password: 'password123' });
  token = registerRes.body.token;

  await User.findOneAndUpdate({ email: 'project-test@example.com' }, { status: 'active' });

  const company = await Company.create({ owner: registerRes.body.data.user._id, name: 'Test Company' });
  await User.findByIdAndUpdate(registerRes.body.data.user._id, { company: company._id });

  const clientRes = await request(app)
    .post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Cliente para proyectos' });
  clientId = clientRes.body.data.client._id;
};

beforeAll(async () => { await connect(); });
afterAll(async () => { await close(); });
beforeEach(async () => { await clear(); await setupUser(); });

describe('Projects - /api/project', () => {
  describe('POST /api/project', () => {
    it('debe crear un proyecto correctamente', async () => {
      const res = await request(app)
        .post('/api/project')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Proyecto Test', projectCode: 'PRJ-001', client: clientId });

      expect(res.status).toBe(201);
      expect(res.body.data.project.name).toBe('Proyecto Test');
      expect(res.body.data.project.projectCode).toBe('PRJ-001');
    });

    it('debe rechazar proyecto sin cliente válido', async () => {
      const res = await request(app)
        .post('/api/project')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Proyecto', projectCode: 'PRJ-002', client: '000000000000000000000000' });

      expect(res.status).toBe(404);
    });

    it('debe rechazar código de proyecto duplicado', async () => {
      await request(app)
        .post('/api/project')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Proyecto 1', projectCode: 'DUP-001', client: clientId });

      const res = await request(app)
        .post('/api/project')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Proyecto 2', projectCode: 'DUP-001', client: clientId });

      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/project', () => {
    it('debe listar proyectos con paginación', async () => {
      await request(app).post('/api/project').set('Authorization', `Bearer ${token}`).send({ name: 'P1', projectCode: 'P1', client: clientId });
      await request(app).post('/api/project').set('Authorization', `Bearer ${token}`).send({ name: 'P2', projectCode: 'P2', client: clientId });

      const res = await request(app).get('/api/project').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.projects).toHaveLength(2);
      expect(res.body.pagination.totalItems).toBe(2);
    });
  });

  describe('DELETE /api/project/:id', () => {
    it('debe archivar un proyecto', async () => {
      const createRes = await request(app)
        .post('/api/project')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'P borrar', projectCode: 'DEL', client: clientId });

      const projectId = createRes.body.data.project._id;
      const deleteRes = await request(app)
        .delete(`/api/project/${projectId}?soft=true`)
        .set('Authorization', `Bearer ${token}`);

      expect(deleteRes.status).toBe(200);
    });
  });
});
