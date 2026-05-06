import { logErrorToSlack } from '../services/logger.service.js';

export const errorHandler = async (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log errores 5XX a Slack
  if (err.statusCode >= 500) {
    logErrorToSlack(err, req).catch(console.error);
  }

  // Error de duplicado de MongoDB
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue).join(', ');
    return res.status(409).json({
      status: 'fail',
      message: `Ya existe un registro con ese ${field}.`,
    });
  }

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ status: 'fail', message: messages.join('; ') });
  }

  // Error de Cast (ObjectId inválido)
  if (err.name === 'CastError') {
    return res.status(400).json({ status: 'fail', message: `ID inválido: ${err.value}` });
  }

  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
    });
  }

  // Producción: no exponer detalles de errores inesperados
  if (err.isOperational) {
    return res.status(err.statusCode).json({ status: err.status, message: err.message });
  }

  console.error('ERROR NO OPERACIONAL:', err);
  return res.status(500).json({ status: 'error', message: 'Algo salió mal.' });
};
