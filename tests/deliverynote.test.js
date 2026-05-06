import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../src/app.js';
import { connect, close, clear } from './setup.js';
import { User } from '../src/models/User.js';
import { Company } from '../src/models/Company.js';

let token;
let clientId;
let projectId;

const setupUser = async () => {
  const registerRes = await request(app)
    .post('/api/user/register')
    .send({ email: 'dn-test@example.com', password: 'password123' });
  token = registerRes.body.token;

  await User.findOneAndUpdate({ email: 'dn-test@example.com' }, { status: 'active' });

  const company = await Company.create({ owner: registerRes.body.data.user._id, name: 'Test Company' });
  await User.findByIdAndUpdate(registerRes.body.data.user._id, { company: company._id });

  const clientRes = await request(app)
    .post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Cliente DN' });
  clientId = clientRes.body.data.client._id;

  const projectRes = await request(app)
    .post('/api/project')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Proyecto DN', projectCode: 'DN-001', client: clientId });
  projectId = projectRes.body.data.project._id;
};

beforeAll(async () => { await connect(); });
afterAll(async () => { await close(); });
beforeEach(async () => { await clear(); await setupUser(); });

describe('DeliveryNotes - /api/deliverynote', () => {
  describe('POST /api/deliverynote', () => {
    it('debe crear un albarán de horas', async () => {
      const res = await request(app)
        .post('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`)
        .send({
          project: projectId,
          client: clientId,
          format: 'hours',
          workDate: '2025-06-01',
          hours: 8,
          description: 'Trabajo de fontanería',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.deliveryNote.format).toBe('hours');
    });

    it('debe crear un albarán de materiales', async () => {
      const res = await request(app)
        .post('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`)
        .send({
          project: projectId,
          client: clientId,
          format: 'material',
          workDate: '2025-06-01',
          material: 'Cemento',
          quantity: 50,
          unit: 'kg',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.deliveryNote.material).toBe('Cemento');
    });

    it('debe rechazar albarán de horas sin campo hours ni workers', async () => {
      const res = await request(app)
        .post('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`)
        .send({
          project: projectId,
          client: clientId,
          format: 'hours',
          workDate: '2025-06-01',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/deliverynote', () => {
    it('debe listar albaranes con filtros', async () => {
      await request(app).post('/api/deliverynote').set('Authorization', `Bearer ${token}`).send({
        project: projectId, client: clientId, format: 'hours', workDate: '2025-06-01', hours: 4,
      });

      const res = await request(app)
        .get(`/api/deliverynote?format=hours&project=${projectId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.deliveryNotes.length).toBeGreaterThan(0);
    });
  });

  describe('DELETE /api/deliverynote/:id', () => {
    it('debe eliminar un albarán no firmado', async () => {
      const createRes = await request(app)
        .post('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`)
        .send({ project: projectId, client: clientId, format: 'hours', workDate: '2025-06-01', hours: 2 });

      const noteId = createRes.body.data.deliveryNote._id;
      const deleteRes = await request(app).delete(`/api/deliverynote/${noteId}`).set('Authorization', `Bearer ${token}`);
      expect(deleteRes.status).toBe(200);
    });

    it('no debe eliminar un albarán ya firmado (mock)', async () => {
      const createRes = await request(app)
        .post('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`)
        .send({ project: projectId, client: clientId, format: 'hours', workDate: '2025-06-01', hours: 2 });

      const noteId = createRes.body.data.deliveryNote._id;

      // Marcar como firmado manualmente
      const { DeliveryNote } = await import('../src/models/DeliveryNote.js');
      await DeliveryNote.findByIdAndUpdate(noteId, { signed: true });

      const deleteRes = await request(app).delete(`/api/deliverynote/${noteId}`).set('Authorization', `Bearer ${token}`);
      expect(deleteRes.status).toBe(409);
    });
  });

  describe('GET /api/deliverynote/:id', () => {
    it('debe obtener un albarán con populate', async () => {
      const createRes = await request(app)
        .post('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`)
        .send({ project: projectId, client: clientId, format: 'hours', workDate: '2025-06-01', hours: 3 });

      const noteId = createRes.body.data.deliveryNote._id;
      const res = await request(app).get(`/api/deliverynote/${noteId}`).set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.deliveryNote.client).toBeDefined();
      expect(res.body.data.deliveryNote.project).toBeDefined();
    });
  });
});
