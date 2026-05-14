import { Client } from '../models/Client.js';
import { AppError } from '../utils/AppError.js';

const getCompanyId = (req) => req.user.company?._id || req.user.company;

// POST /api/client
export const createClient = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    if (!companyId) return next(new AppError('Debes tener una compañía para crear clientes.', 400));

    const client = await Client.create({ ...req.body, user: req.user._id, company: companyId });

    req.io?.to(String(companyId)).emit('client:new', client);

    res.status(201).json({ status: 'success', data: { client } });
  } catch (err) {
    next(err);
  }
};

// PUT /api/client/:id
export const updateClient = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, company: companyId, deleted: false },
      req.body,
      { new: true, runValidators: true }
    );
    if (!client) return next(new AppError('Cliente no encontrado.', 404));
    res.json({ status: 'success', data: { client } });
  } catch (err) {
    next(err);
  }
};

// GET /api/client
export const getClients = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const { page = 1, limit = 10, name, sort = '-createdAt' } = req.query;

    const filter = { company: companyId, deleted: false };
    if (name) filter.name = { $regex: name, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [clients, totalItems] = await Promise.all([
      Client.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Client.countDocuments(filter),
    ]);

    res.json({
      status: 'success',
      data: { clients },
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / parseInt(limit)),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/client/archived
export const getArchivedClients = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const clients = await Client.find({ company: companyId, deleted: true });
    res.json({ status: 'success', data: { clients } });
  } catch (err) {
    next(err);
  }
};

// GET /api/client/:id
export const getClient = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const client = await Client.findOne({ _id: req.params.id, company: companyId, deleted: false });
    if (!client) return next(new AppError('Cliente no encontrado.', 404));
    res.json({ status: 'success', data: { client } });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/client/:id
export const deleteClient = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const soft = req.query.soft !== 'false';
    let client;

    if (soft) {
      client = await Client.findOneAndUpdate(
        { _id: req.params.id, company: companyId, deleted: false },
        { deleted: true, deletedAt: new Date() },
        { new: true }
      );
    } else {
      client = await Client.findOneAndDelete({ _id: req.params.id, company: companyId });
    }

    if (!client) return next(new AppError('Cliente no encontrado.', 404));
    res.json({ status: 'success', message: `Cliente ${soft ? 'archivado' : 'eliminado'} correctamente.` });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/client/:id/restore
export const restoreClient = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, company: companyId, deleted: true },
      { deleted: false, deletedAt: null },
      { new: true }
    );
    if (!client) return next(new AppError('Cliente archivado no encontrado.', 404));
    res.json({ status: 'success', data: { client } });
  } catch (err) {
    next(err);
  }
};
