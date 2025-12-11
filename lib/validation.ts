import { z } from 'zod';
import { DIFFICULTY_RATINGS, TERRAIN_RATINGS } from '@/config/irc26';

// Image object schema for pledge images
const imageSchema = z.object({
  url: z.string().url(),
  key: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
});

// Pledge schema
export const pledgeSchema = z.object({
  gcUsername: z.string().min(1, 'Geocaching username is required').max(100),
  title: z.string().max(200).optional(),
  cacheType: z.enum(['TRADITIONAL', 'MULTI', 'MYSTERY', 'LETTERBOX', 'WHERIGO', 'VIRTUAL']),
  cacheSize: z.enum(['NANO', 'MICRO', 'SMALL', 'REGULAR', 'LARGE', 'OTHER']),
  approxSuburb: z.string().min(1, 'Approximate suburb is required').max(200),
  approxState: z.enum(['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA']),
  conceptNotes: z.string().optional(),
  images: z.array(imageSchema).max(3, 'Maximum 3 images allowed').optional().default([]),
});

// Submission schema
export const submissionSchema = z.object({
  pledgeId: z.string().min(1, 'Pledge ID is required'),
  gcCode: z.string().regex(/^GC[A-Z0-9]+$/, 'Invalid GC code format'),
  cacheName: z.string().min(1, 'Cache name is required').max(200),
  suburb: z.string().min(1, 'Suburb is required').max(200),
  state: z.enum(['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA']),
  difficulty: z.number().min(1.0).max(5.0).refine((val) => (DIFFICULTY_RATINGS as unknown as number[]).includes(val), {
    message: 'Difficulty must be in 0.5 increments from 1.0 to 5.0',
  }),
  terrain: z.number().min(1.0).max(5.0).refine((val) => (TERRAIN_RATINGS as unknown as number[]).includes(val), {
    message: 'Terrain must be in 0.5 increments from 1.0 to 5.0',
  }),
  type: z.enum(['TRADITIONAL', 'MULTI', 'MYSTERY', 'LETTERBOX', 'WHERIGO', 'VIRTUAL']),
  hiddenDate: z.string().datetime().or(z.date()),
  notes: z.string().optional(),
});

// Update pledge schema
export const updatePledgeSchema = pledgeSchema.partial().extend({
  gcUsername: z.string().min(1).max(100).optional(),
  cacheType: z.enum(['TRADITIONAL', 'MULTI', 'MYSTERY', 'LETTERBOX', 'WHERIGO', 'VIRTUAL']).optional(),
  cacheSize: z.enum(['NANO', 'MICRO', 'SMALL', 'REGULAR', 'LARGE', 'OTHER']).optional(),
  approxSuburb: z.string().min(1).max(200).optional(),
  approxState: z.enum(['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA']).optional(),
  images: z.array(imageSchema).max(3, 'Maximum 3 images allowed').optional(),
});

// Alias for backward compatibility (used by manage route)
export const editPledgeSchema = updatePledgeSchema;

// Update submission schema
export const updateSubmissionSchema = submissionSchema.partial().extend({
  pledgeId: z.string().optional(),
  images: z.array(imageSchema).max(3, 'Maximum 3 images allowed').optional(),
});

// GC username update schema
export const gcUsernameSchema = z.object({
  gcUsername: z.string().min(1, 'Geocaching username is required').max(100),
});

export const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

