// src/lib/imageUtils.js
// Helper utilities for image processing using sharp
import sharp from 'sharp';
import path from 'path';

/**
 * Resize an image to the given width while preserving aspect ratio.
 * The output format is inferred from the input file extension.
 *
 * @param {string} inputPath - Absolute path to the original image file.
 * @param {string} outputPath - Absolute path where the resized image will be saved.
 * @param {number} width - Desired width in pixels (height is auto‑scaled).
 * @returns {Promise<void>} Resolves when the file has been written.
 */
export async function resizeImage(inputPath, outputPath, width) {
    await sharp(inputPath)
        .resize({ width, withoutEnlargement: true })
        .toFile(outputPath);
}

/**
 * Generate a filename for the resized version.
 * Example: original "1623456789-photo.jpg" -> "1623456789-photo-small.jpg"
 */
export function getResizedFilename(originalFilename) {
    const { name, ext } = path.parse(originalFilename);
    return `${name}-small${ext}`;
}
