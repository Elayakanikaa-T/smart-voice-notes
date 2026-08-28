import { z } from 'zod';

export const InitNoteUploadSchema = z.object({
  subjectId: z.string().min(1, 'Valid subject ID is required'),
  folderId: z.string().nullable().optional(),
  title: z.string().min(1, 'Title is required').max(255),
  durationSeconds: z.number().int().nonnegative().optional().default(0),
  fileSizeBytes: z.number().int().nonnegative().optional().default(0),
  contentType: z.string().optional().default('audio/m4a'),
});

export const CreateTextNoteSchema = z.object({
  subjectId: z.string().min(1, 'Valid subject ID is required'),
  title: z.string().min(1, 'Note title is required').max(255),
  topic: z.string().optional(),
  content: z.string().min(1, 'Note text content is required'),
});

export const UpdateNoteSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  subjectId: z.string().optional(),
  folderId: z.string().nullable().optional(),
  isFavorite: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  durationSeconds: z.number().int().nonnegative().optional(),
  status: z.enum(['recording', 'uploaded', 'transcribing', 'processing', 'ready', 'failed']).optional(),
  transcript: z.string().optional(),
  content: z.string().optional(),
});

export const SyncNotesBatchSchema = z.object({
  lastSyncTimestamp: z.string().datetime().optional(),
  clientChanges: z.array(
    z.object({
      id: z.string().uuid(),
      subjectId: z.string().uuid(),
      folderId: z.string().uuid().nullable().optional(),
      title: z.string(),
      durationSeconds: z.number().optional().default(0),
      status: z.string().optional().default('ready'),
      syncVersion: z.number().int(),
      clientUpdatedAt: z.string().datetime(),
      isDeleted: z.boolean().optional().default(false),
    })
  ).default([]),
});

export const SearchNotesSchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  subjectId: z.string().uuid().optional(),
  limit: z.coerce.number().int().positive().max(50).default(20),
  offset: z.coerce.number().int().nonnegative().default(0),
});
