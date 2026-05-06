import { Router } from 'express';
import {
  register, validateEmail, login, updatePersonalData,
  upsertCompany, uploadCompanyLogo, getMe, deleteMe,
} from '../controllers/user.controller.js';
import { protect, requireVerified } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rate-limit.js';
import { upload } from '../middleware/upload.js';
import {
  registerSchema, loginSchema, validationCodeSchema, updateUserSchema, companySchema,
} from '../validators/user.validator.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestión de usuarios y autenticación
 */

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Users]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *       409:
 *         description: Email ya registrado
 */
router.post('/register', authLimiter, validate(registerSchema), register);

/**
 * @swagger
 * /api/user/validation:
 *   put:
 *     summary: Validar email con código
 *     tags: [Users]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code]
 *             properties:
 *               email: { type: string }
 *               code: { type: string }
 *     responses:
 *       200:
 *         description: Email verificado correctamente
 */
router.put('/validation', validate(validationCodeSchema), validateEmail);

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Users]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login exitoso con token JWT
 */
router.post('/login', authLimiter, validate(loginSchema), login);

router.use(protect);

/**
 * @swagger
 * /api/user/register:
 *   put:
 *     summary: Actualizar datos personales del usuario
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Datos actualizados
 */
router.put('/register', validate(updateUserSchema), updatePersonalData);

/**
 * @swagger
 * /api/user/company:
 *   patch:
 *     summary: Crear o actualizar compañía del usuario
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Compañía actualizada
 */
router.patch('/company', validate(companySchema), upsertCompany);

/**
 * @swagger
 * /api/user/logo:
 *   patch:
 *     summary: Subir logo de la compañía
 *     tags: [Users]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               logo: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Logo subido correctamente
 */
router.patch('/logo', upload.single('logo'), uploadCompanyLogo);

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Obtener usuario autenticado
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Datos del usuario
 *   delete:
 *     summary: Eliminar/archivar cuenta
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: soft
 *         schema: { type: boolean }
 *         description: Soft delete (por defecto true)
 *     responses:
 *       200:
 *         description: Usuario eliminado
 */
router.get('/', getMe);
router.delete('/', deleteMe);

export default router;
