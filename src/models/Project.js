import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    name: { type: String, required: true, trim: true },
    projectCode: { type: String, required: true, trim: true },
    address: {
      street: String,
      number: String,
      postal: String,
      city: String,
      province: String,
    },
    email: { type: String, trim: true, lowercase: true },
    notes: { type: String },
    active: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

// Índice único por projectCode dentro de la misma compañía
projectSchema.index({ projectCode: 1, company: 1 }, { unique: true });

export const Project = mongoose.model('Project', projectSchema);
