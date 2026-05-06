import mongoose from 'mongoose';

const deliveryNoteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    format: { type: String, enum: ['material', 'hours'], required: true },
    description: { type: String },
    workDate: { type: Date, required: true },
    // Para format: 'material'
    material: { type: String },
    quantity: { type: Number },
    unit: { type: String },
    // Para format: 'hours'
    hours: { type: Number },
    workers: [
      {
        name: { type: String },
        hours: { type: Number },
      },
    ],
    // Firma
    signed: { type: Boolean, default: false },
    signedAt: { type: Date },
    signatureUrl: { type: String },
    pdfUrl: { type: String },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

export const DeliveryNote = mongoose.model('DeliveryNote', deliveryNoteSchema);
