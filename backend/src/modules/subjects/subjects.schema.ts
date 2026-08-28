import { z } from 'zod';

export const CreateSubjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required').max(150),
  code: z.string().optional(),
  color: z.string().optional().default('#6366F1'),
  icon: z.string().optional().default('folder'),
  description: z.string().optional(),
}).passthrough();


export const UpdateSubjectSchema = CreateSubjectSchema.partial();

export const CreateFolderSchema = z.object({
  subjectId: z.string().uuid('Valid subject ID is required'),
  name: z.string().min(1, 'Folder name is required').max(150),
  parentFolderId: z.string().uuid().nullable().optional(),
});

export const UpdateFolderSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  parentFolderId: z.string().uuid().nullable().optional(),
});
