import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  email: z.string().trim().email('Enter a valid email'),
  phone: z
    .string()
    .trim()
    .regex(/^\+8801[3-9]\d{8}$/, 'Use the format +8801XXXXXXXXX'),
  storeName: z.string().trim().min(2, 'Store name is required'),
  notifications: z.object({
    newOrder: z.boolean(),
    lowStock: z.boolean(),
    weeklyReport: z.boolean(),
  }),
});

export type ProfileForm = z.infer<typeof profileSchema>;
