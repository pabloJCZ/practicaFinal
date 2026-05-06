import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    name: { type: String, trim: true },
    surnames: { type: String, trim: true },
    nif: { type: String, trim: true },
    phone: { type: String, trim: true },
    role: { type: String, enum: ['user', 'guest', 'admin'], default: 'user' },
    status: { type: String, enum: ['pending', 'active'], default: 'pending' },
    verificationCode: { type: String, select: false },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);
