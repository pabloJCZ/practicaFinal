import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    cif: { type: String, trim: true },
    address: {
      street: String,
      number: String,
      postal: String,
      city: String,
      province: String,
    },
    logoUrl: { type: String },
  },
  { timestamps: true }
);

export const Company = mongoose.model('Company', companySchema);
