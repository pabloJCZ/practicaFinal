import { z } from 'zod';

const addressSchema = z.object({
  street: z.string().optional(),
  number: z.string().optional(),
  postal: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
});

export const createClientSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  cif: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  address: addressSchema.optional(),
});

export const updateClientSchema = createClientSchema.partial();
