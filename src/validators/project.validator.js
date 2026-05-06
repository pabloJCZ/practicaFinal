import { z } from 'zod';

const addressSchema = z.object({
  street: z.string().optional(),
  number: z.string().optional(),
  postal: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
});

export const createProjectSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  projectCode: z.string().min(1, 'El código de proyecto es obligatorio'),
  client: z.string().min(1, 'El cliente es obligatorio'),
  address: addressSchema.optional(),
  email: z.string().email('Email inválido').optional(),
  notes: z.string().optional(),
  active: z.boolean().optional(),
});

export const updateProjectSchema = createProjectSchema.partial();
