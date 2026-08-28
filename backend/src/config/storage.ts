import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from './env.js';
import { logger } from '../utils/logger.js';

let s3Client: S3Client | null = null;

if (config.storage.driver === 's3' && config.storage.accessKeyId && config.storage.secretAccessKey) {
  s3Client = new S3Client({
    region: config.storage.awsRegion,
    credentials: {
      accessKeyId: config.storage.accessKeyId,
      secretAccessKey: config.storage.secretAccessKey,
    },
  });
}

// Ensure local upload dir exists
if (!fs.existsSync(config.storage.localUploadDir)) {
  fs.mkdirSync(config.storage.localUploadDir, { recursive: true });
}

export interface SignedUploadUrlResult {
  uploadUrl: string;
  downloadUrl: string;
  s3Key: string;
  expiresInSeconds: number;
}

export async function generateUploadUrl(
  userId: string,
  noteId: string,
  contentType: string = 'audio/m4a'
): Promise<SignedUploadUrlResult> {
  const s3Key = `audio/${userId}/${noteId}.m4a`;

  if (s3Client && config.storage.driver === 's3') {
    try {
      const putCommand = new PutObjectCommand({
        Bucket: config.storage.bucketName,
        Key: s3Key,
        ContentType: contentType,
      });

      const getCommand = new GetObjectCommand({
        Bucket: config.storage.bucketName,
        Key: s3Key,
      });

      const uploadUrl = await getSignedUrl(s3Client, putCommand, {
        expiresIn: config.storage.signedUrlExpiry,
      });
      const downloadUrl = await getSignedUrl(s3Client, getCommand, {
        expiresIn: config.storage.signedUrlExpiry,
      });

      return {
        uploadUrl,
        downloadUrl,
        s3Key,
        expiresInSeconds: config.storage.signedUrlExpiry,
      };
    } catch (error: any) {
      logger.error('[Storage] S3 signed URL generation failed:', error);
    }
  }

  // Local storage provider fallback with direct upload/download routes
  const baseUrl = `http://localhost:${config.port}${config.apiPrefix}`;
  return {
    uploadUrl: `${baseUrl}/notes/${noteId}/upload-audio`,
    downloadUrl: `${baseUrl}/notes/${noteId}/audio`,
    s3Key,
    expiresInSeconds: config.storage.signedUrlExpiry,
  };
}

export async function generateDownloadUrl(s3Key: string): Promise<string> {
  if (s3Client && config.storage.driver === 's3') {
    try {
      const getCommand = new GetObjectCommand({
        Bucket: config.storage.bucketName,
        Key: s3Key,
      });
      return await getSignedUrl(s3Client, getCommand, {
        expiresIn: config.storage.signedUrlExpiry,
      });
    } catch (error) {
      logger.error('[Storage] Failed to generate S3 download URL:', error);
    }
  }
  return `/uploads/${s3Key.replace(/^audio\//, '')}`;
}
