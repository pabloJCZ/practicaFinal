import { DeliveryNote } from '../models/DeliveryNote.js';
import { Project } from '../models/Project.js';
import { AppError } from '../utils/AppError.js';
import { generateDeliveryNotePDF } from '../services/pdf.service.js';
import { uploadSignature, uploadPdf } from '../services/storage.service.js';

const getCompanyId = (req) => req.user.company?._id || req.user.company;

// POST /api/deliverynote
export const createDeliveryNote = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    if (!companyId) return next(new AppError('Debes tener una compañía para crear albaranes.', 400));

    // Verificar que el proyecto pertenece a la compañía
    const project = await Project.findOne({ _id: req.body.project, company: companyId, deleted: false });
    if (!project) return next(new AppError('Proyecto no encontrado en tu compañía.', 404));

    const note = await DeliveryNote.create({ ...req.body, user: req.user._id, company: companyId });

    req.io?.to(String(companyId)).emit('deliverynote:new', note);

    res.status(201).json({ status: 'success', data: { deliveryNote: note } });
  } catch (err) {
    next(err);
  }
};

// GET /api/deliverynote
export const getDeliveryNotes = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const { page = 1, limit = 10, project, client, format, signed, from, to, sort = '-workDate' } = req.query;

    const filter = { company: companyId, deleted: false };
    if (project) filter.project = project;
    if (client) filter.client = client;
    if (format) filter.format = format;
    if (signed !== undefined) filter.signed = signed === 'true';
    if (from || to) {
      filter.workDate = {};
      if (from) filter.workDate.$gte = new Date(from);
      if (to) filter.workDate.$lte = new Date(to);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [notes, totalItems] = await Promise.all([
      DeliveryNote.find(filter)
        .populate('client', 'name')
        .populate('project', 'name projectCode')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      DeliveryNote.countDocuments(filter),
    ]);

    res.json({
      status: 'success',
      data: { deliveryNotes: notes },
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

// GET /api/deliverynote/:id
export const getDeliveryNote = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const note = await DeliveryNote.findOne({ _id: req.params.id, company: companyId, deleted: false })
      .populate('user', 'name email')
      .populate('client')
      .populate('project');
    if (!note) return next(new AppError('Albarán no encontrado.', 404));
    res.json({ status: 'success', data: { deliveryNote: note } });
  } catch (err) {
    next(err);
  }
};

// GET /api/deliverynote/pdf/:id
export const downloadPDF = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const note = await DeliveryNote.findOne({ _id: req.params.id, company: companyId, deleted: false })
      .populate('user', 'name email')
      .populate('company')
      .populate('client')
      .populate('project');

    if (!note) return next(new AppError('Albarán no encontrado.', 404));

    // Si ya está firmado y tiene PDF en la nube, redirigir
    if (note.signed && note.pdfUrl) {
      return res.redirect(note.pdfUrl);
    }

    const pdfBuffer = await generateDeliveryNotePDF(note);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="albaran_${note._id}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/deliverynote/:id/sign
export const signDeliveryNote = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const note = await DeliveryNote.findOne({ _id: req.params.id, company: companyId, deleted: false })
      .populate('user', 'name email')
      .populate('company')
      .populate('client')
      .populate('project');

    if (!note) return next(new AppError('Albarán no encontrado.', 404));
    if (note.signed) return next(new AppError('Este albarán ya está firmado.', 409));
    if (!req.file) return next(new AppError('Se requiere imagen de firma.', 400));

    // Subir firma
    const signatureUrl = await uploadSignature(req.file.buffer, `sign_${note._id}_${Date.now()}`);

    // Generar y subir PDF
    note.signed = true;
    note.signedAt = new Date();
    note.signatureUrl = signatureUrl;
    const pdfBuffer = await generateDeliveryNotePDF(note);
    const pdfUrl = await uploadPdf(pdfBuffer, `pdf_${note._id}`);
    note.pdfUrl = pdfUrl;

    await note.save();

    req.io?.to(String(companyId)).emit('deliverynote:signed', { id: note._id });

    res.json({ status: 'success', data: { deliveryNote: note } });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/deliverynote/:id
export const deleteDeliveryNote = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const note = await DeliveryNote.findOne({ _id: req.params.id, company: companyId, deleted: false });
    if (!note) return next(new AppError('Albarán no encontrado.', 404));
    if (note.signed) return next(new AppError('No se puede eliminar un albarán firmado.', 409));

    await DeliveryNote.findByIdAndUpdate(req.params.id, { deleted: true, deletedAt: new Date() });
    res.json({ status: 'success', message: 'Albarán eliminado correctamente.' });
  } catch (err) {
    next(err);
  }
};
