import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import swaggerUi from 'swagger-ui-express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

import { config } from './config/index.js';
import { swaggerSpec } from './config/swagger.js';
import { generalLimiter } from './middleware/rate-limit.js';
import { errorHandler } from './middleware/error-handler.js';
import { AppError } from './utils/AppError.js';
import { User } from './models/User.js';
import routes from './routes/index.js';

const app = express();
const httpServer = createServer(app);

// --- Socket.IO ---
const io = new Server(httpServer, {
  cors: { origin: config.frontendUrl, methods: ['GET', 'POST'] },
});

// Autenticación JWT en Socket.IO
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No autenticado'));
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.id).populate('company');
    if (!user || user.deleted) return next(new Error('Usuario no válido'));
    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Token inválido'));
  }
});

io.on('connection', (socket) => {
  const companyId = socket.user.company?._id;
  if (companyId) {
    socket.join(String(companyId));
    console.log(`Socket ${socket.id} unido a room: ${companyId}`);
  }
  socket.on('disconnect', () => {
    console.log(`Socket ${socket.id} desconectado`);
  });
});

// --- Middleware globales ---
app.use(helmet());
app.use(cors({ origin: config.frontendUrl }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(mongoSanitize());
app.use(generalLimiter);

// Inyectar io en las requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// --- Swagger ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Rutas ---
app.use('/api', routes);
app.get('/health', (req, res) => {
  // Alias directo en raíz
  res.redirect('/api/health');
});

// --- Ruta no encontrada ---
app.all('*', (req, res, next) => {
  next(new AppError(`Ruta ${req.originalUrl} no encontrada.`, 404));
});

// --- Error handler global ---
app.use(errorHandler);

export { app, httpServer, io };
