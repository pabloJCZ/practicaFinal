import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('No autenticado. Proporciona un token JWT.', 401));
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);

    const user = await User.findById(decoded.id).populate('company');
    if (!user) {
      return next(new AppError('El usuario ya no existe.', 401));
    }
    if (user.deleted) {
      return next(new AppError('Esta cuenta ha sido eliminada.', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new AppError('Token inválido o expirado.', 401));
  }
};

export const requireVerified = (req, res, next) => {
  if (req.user.status !== 'active') {
    return next(new AppError('Debes verificar tu email antes de continuar.', 403));
  }
  next();
};

export const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('No tienes permiso para realizar esta acción.', 403));
  }
  next();
};
