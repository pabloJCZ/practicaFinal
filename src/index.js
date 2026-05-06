import 'dotenv/config';
import { httpServer, io } from './app.js';
import { connectDB } from './config/database.js';
import { config } from './config/index.js';
import mongoose from 'mongoose';

const startServer = async () => {
  await connectDB();

  const server = httpServer.listen(config.port, () => {
    console.log(`🚀 BildyApp API corriendo en http://localhost:${config.port}`);
    console.log(`📚 Swagger UI disponible en http://localhost:${config.port}/api-docs`);
  });

  // --- Graceful Shutdown ---
  const shutdown = async (signal) => {
    console.log(`\n${signal} recibido. Cerrando servidor...`);

    server.close(async () => {
      console.log('HTTP server cerrado.');
      io.close(() => console.log('Socket.IO cerrado.'));
      await mongoose.connection.close();
      console.log('MongoDB desconectado.');
      process.exit(0);
    });

    // Forzar cierre tras 10s
    setTimeout(() => {
      console.error('Forzando cierre tras timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION:', err);
    shutdown('UNHANDLED_REJECTION');
  });
};

startServer();
