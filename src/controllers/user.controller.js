import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { Company } from '../models/Company.js';
import { AppError } from '../utils/AppError.js';
import { config } from '../config/index.js';
import { sendVerificationEmail } from '../services/mail.service.js';
import { uploadLogo } from '../services/storage.service.js';

const signToken = (id) =>
  jwt.sign({ id }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

// POST /api/user/register
export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return next(new AppError('Ya existe un usuario con ese email.', 409));

    const code = crypto.randomInt(100000, 999999).toString();
    const user = await User.create({ email, password, verificationCode: code });

    await sendVerificationEmail(email, code);

    const token = signToken(user._id);
    res.status(201).json({ status: 'success', token, data: { user: { _id: user._id, email: user.email } } });
  } catch (err) {
    next(err);
  }
};

// PUT /api/user/validation
export const validateEmail = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email }).select('+verificationCode');
    if (!user || user.verificationCode !== code) {
      return next(new AppError('Código de verificación inválido.', 400));
    }
    user.status = 'active';
    user.verificationCode = undefined;
    await user.save();
    res.json({ status: 'success', message: 'Email verificado correctamente.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/user/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, deleted: false }).select('+password').populate('company');
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Email o contraseña incorrectos.', 401));
    }
    const token = signToken(user._id);
    user.password = undefined;
    res.json({ status: 'success', token, data: { user } });
  } catch (err) {
    next(err);
  }
};

// PUT /api/user/register (datos personales)
export const updatePersonalData = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true, runValidators: true });
    res.json({ status: 'success', data: { user } });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/user/company
export const upsertCompany = async (req, res, next) => {
  try {
    let company;
    if (req.user.company) {
      company = await Company.findByIdAndUpdate(req.user.company, req.body, { new: true });
    } else {
      company = await Company.create({ ...req.body, owner: req.user._id });
      await User.findByIdAndUpdate(req.user._id, { company: company._id });
    }
    res.json({ status: 'success', data: { company } });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/user/logo
export const uploadCompanyLogo = async (req, res, next) => {
  try {
    if (!req.file) return next(new AppError('No se ha subido ningún archivo.', 400));
    if (!req.user.company) return next(new AppError('Primero crea una compañía.', 400));

    const url = await uploadLogo(req.file.buffer, `logo_${req.user.company}`);
    const company = await Company.findByIdAndUpdate(req.user.company, { logoUrl: url }, { new: true });
    res.json({ status: 'success', data: { company } });
  } catch (err) {
    next(err);
  }
};

// GET /api/user
export const getMe = async (req, res) => {
  res.json({ status: 'success', data: { user: req.user } });
};

// DELETE /api/user
export const deleteMe = async (req, res, next) => {
  try {
    const soft = req.query.soft !== 'false';
    if (soft) {
      await User.findByIdAndUpdate(req.user._id, { deleted: true, deletedAt: new Date() });
    } else {
      await User.findByIdAndDelete(req.user._id);
    }
    res.json({ status: 'success', message: `Usuario ${soft ? 'archivado' : 'eliminado'} correctamente.` });
  } catch (err) {
    next(err);
  }
};
