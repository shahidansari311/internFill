import { z } from 'zod';

export const applicationSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  role: z.string().min(1, 'Job role is required'),
  website: z.string().url('Must be a valid URL starting with http:// or https://').or(z.literal('')),
  status: z.enum(['applied', 'interview', 'rejected', 'offer']),
  notes: z.string(),
  profileId: z.number().int().min(1, 'Please select a profile'),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;
