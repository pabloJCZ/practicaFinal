import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';
import { config } from '../config/index.js';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

/**
 * Sube una imagen de firma a Cloudinary.
 * Usa Sharp para optimizar antes de subir (max 800px ancho, WebP).
 */
export const uploadSignature = async (buffer, filename) => {
  const optimized = await sharp(buffer)
    .resize({ width: 800, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'bildyapp/signatures', public_id: filename, resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(optimized);
  });
};

/**
 * Sube un PDF a Cloudinary.
 */
export const uploadPdf = async (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'bildyapp/pdfs', public_id: filename, resource_type: 'raw' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

/**
 * Sube un logo de empresa a Cloudinary.
 */
export const uploadLogo = async (buffer, filename) => {
  const optimized = await sharp(buffer)
    .resize({ width: 400, withoutEnlargement: true })
    .webp({ quality: 90 })
    .toBuffer();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'bildyapp/logos', public_id: filename, resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(optimized);
  });
};
