import sharp from 'sharp';

// Returns a base64 string of the compressed screenshot
export async function compressScreenshot(
  input: Buffer
): Promise<string> {
  try {
    const image = sharp(input)
      .resize(1000, 1000, {  // Max dimensions that maintain legibility
        fit: 'inside',
        withoutEnlargement: true
      })
      .png({
        quality: 50,
        compressionLevel: 9
      });

    const compressedBuffer = await image.toBuffer();
    return compressedBuffer.toString('base64');
  } catch (error) {
    console.error('Error compressing screenshot:', error);
    throw error;
  }
}
