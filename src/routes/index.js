import { Router } from 'express';
import userRoutes from './user.routes.js';
import clientRoutes from './client.routes.js';
import projectRoutes from './project.routes.js';
import deliveryNoteRoutes from './deliverynote.routes.js';
import { getDBStatus } from '../config/database.js';

const router = Router();

router.use('/user', userRoutes);
router.use('/client', clientRoutes);
router.use('/project', projectRoutes);
router.use('/deliverynote', deliveryNoteRoutes);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check del servidor
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Estado del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string }
 *                 db: { type: string }
 *                 uptime: { type: number }
 *                 timestamp: { type: string }
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    db: getDBStatus(),
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

export default router;
