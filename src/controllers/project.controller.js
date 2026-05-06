import { Project } from '../models/Project.js';
import { Client } from '../models/Client.js';
import { AppError } from '../utils/AppError.js';

const getCompanyId = (req) => req.user.company?._id || req.user.company;

// POST /api/project
export const createProject = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    if (!companyId) return next(new AppError('Debes tener una compañía para crear proyectos.', 400));

    // Verificar que el cliente pertenece a la compañía
    const client = await Client.findOne({ _id: req.body.client, company: companyId, deleted: false });
    if (!client) return next(new AppError('Cliente no encontrado en tu compañía.', 404));

    const project = await Project.create({ ...req.body, user: req.user._id, company: companyId });

    req.io?.to(String(companyId)).emit('project:new', project);

    res.status(201).json({ status: 'success', data: { project } });
  } catch (err) {
    next(err);
  }
};

// PUT /api/project/:id
export const updateProject = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, company: companyId, deleted: false },
      req.body,
      { new: true, runValidators: true }
    );
    if (!project) return next(new AppError('Proyecto no encontrado.', 404));
    res.json({ status: 'success', data: { project } });
  } catch (err) {
    next(err);
  }
};

// GET /api/project
export const getProjects = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const { page = 1, limit = 10, name, client, active, sort = '-createdAt' } = req.query;

    const filter = { company: companyId, deleted: false };
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (client) filter.client = client;
    if (active !== undefined) filter.active = active === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [projects, totalItems] = await Promise.all([
      Project.find(filter).populate('client', 'name cif').sort(sort).skip(skip).limit(parseInt(limit)),
      Project.countDocuments(filter),
    ]);

    res.json({
      status: 'success',
      data: { projects },
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

// GET /api/project/archived
export const getArchivedProjects = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const projects = await Project.find({ company: companyId, deleted: true }).populate('client', 'name');
    res.json({ status: 'success', data: { projects } });
  } catch (err) {
    next(err);
  }
};

// GET /api/project/:id
export const getProject = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const project = await Project.findOne({ _id: req.params.id, company: companyId, deleted: false }).populate('client');
    if (!project) return next(new AppError('Proyecto no encontrado.', 404));
    res.json({ status: 'success', data: { project } });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/project/:id
export const deleteProject = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const soft = req.query.soft !== 'false';
    let project;

    if (soft) {
      project = await Project.findOneAndUpdate(
        { _id: req.params.id, company: companyId, deleted: false },
        { deleted: true, deletedAt: new Date() },
        { new: true }
      );
    } else {
      project = await Project.findOneAndDelete({ _id: req.params.id, company: companyId });
    }

    if (!project) return next(new AppError('Proyecto no encontrado.', 404));
    res.json({ status: 'success', message: `Proyecto ${soft ? 'archivado' : 'eliminado'} correctamente.` });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/project/:id/restore
export const restoreProject = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, company: companyId, deleted: true },
      { deleted: false, deletedAt: null },
      { new: true }
    );
    if (!project) return next(new AppError('Proyecto archivado no encontrado.', 404));
    res.json({ status: 'success', data: { project } });
  } catch (err) {
    next(err);
  }
};
