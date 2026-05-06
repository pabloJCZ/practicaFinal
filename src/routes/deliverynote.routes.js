import { Router } from 'express';
import {
  createDeliveryNote, getDeliveryNotes, getDeliveryNote,
  downloadPDF, signDeliveryNote, deleteDeliveryNote,
} from '../controllers/deliverynote.controller.js';
import { protect, requireVerified } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import { createDeliveryNoteSchema } from '../validators/deliverynote.validator.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.use(protect, requireVerified);

/**
 * @swagger
 * tags:
 *   name: DeliveryNotes
 *   description: Gestión de albaranes
 */

/**
 * @swagger
 * /api/deliverynote:
 *   post:
 *     summary: Crear un albarán
 *     tags: [DeliveryNotes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeliveryNote'
 *     responses:
 *       201:
 *         description: Albarán creado
 *   get:
 *     summary: Listar albaranes (con paginación y filtros)
 *     tags: [DeliveryNotes]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: project
 *         schema: { type: string }
 *       - in: query
 *         name: client
 *         schema: { type: string }
 *       - in: query
 *         name: format
 *         schema: { type: string, enum: [material, hours] }
 *       - in: query
 *         name: signed
 *         schema: { type: boolean }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: sort
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista de albaranes
 */
router.route('/').post(validate(createDeliveryNoteSchema), createDeliveryNote).get(getDeliveryNotes);

/**
 * @swagger
 * /api/deliverynote/pdf/{id}:
 *   get:
 *     summary: Descargar albarán en PDF
 *     tags: [DeliveryNotes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: PDF del albarán
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/pdf/:id', downloadPDF);

/**
 * @swagger
 * /api/deliverynote/{id}:
 *   get:
 *     summary: Obtener un albarán concreto (con populate)
 *     tags: [DeliveryNotes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Datos del albarán
 *   delete:
 *     summary: Borrar un albarán (solo si no está firmado)
 *     tags: [DeliveryNotes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Albarán eliminado
 *       409:
 *         description: No se puede eliminar un albarán firmado
 */
router.route('/:id').get(getDeliveryNote).delete(deleteDeliveryNote);

/**
 * @swagger
 * /api/deliverynote/{id}/sign:
 *   patch:
 *     summary: Firmar un albarán (multipart/form-data)
 *     tags: [DeliveryNotes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               signature:
 *                 type: string
 *                 format: binary
 *                 description: Imagen de la firma
 *     responses:
 *       200:
 *         description: Albarán firmado correctamente
 *       409:
 *         description: El albarán ya está firmado
 */
router.patch('/:id/sign', upload.single('signature'), signDeliveryNote);

export default router;
