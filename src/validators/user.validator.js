import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export const validationCodeSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, 'El código debe tener 6 dígitos'),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  surnames: z.string().optional(),
  nif: z.string().optional(),
  phone: z.string().optional(),
});

const addressSchema = z.object({
  street: z.string().optional(),
  number: z.string().optional(),
  postal: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
});

export const companySchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  cif: z.string().optional(),
  address: addressSchema.optional(),
});
