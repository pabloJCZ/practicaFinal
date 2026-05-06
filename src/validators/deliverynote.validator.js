import { z } from 'zod';

const workerSchema = z.object({
  name: z.string().min(1),
  hours: z.number().positive(),
});

export const createDeliveryNoteSchema = z
  .object({
    project: z.string().min(1, 'El proyecto es obligatorio'),
    client: z.string().min(1, 'El cliente es obligatorio'),
    format: z.enum(['material', 'hours'], { required_error: 'El formato es obligatorio' }),
    description: z.string().optional(),
    workDate: z.string().or(z.date()),
    // Material fields
    material: z.string().optional(),
    quantity: z.number().positive().optional(),
    unit: z.string().optional(),
    // Hours fields
    hours: z.number().positive().optional(),
    workers: z.array(workerSchema).optional(),
  })
  .refine(
    (data) => {
      if (data.format === 'material') return !!data.material;
      if (data.format === 'hours') return data.hours !== undefined || (data.workers && data.workers.length > 0);
      return true;
    },
    {
      message: 'Para albaranes de material, se requiere "material". Para horas, se requiere "hours" o "workers".',
    }
  );
