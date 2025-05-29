// pages/api/compress.js
import sharp from 'sharp';
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { image_url, quality = '60' } = req.query;

  if (!image_url) {
    return res.status(400).send('Missing image_url');
  }

  try {
    const response = await fetch(image_url);

    if (!response.ok || !response.body) {
      return res.status(502).send('Failed to fetch source image');
    }

    const buffer = await response.buffer();

    const output = await sharp(buffer)
      .webp({ quality: parseInt(quality) })
      .toBuffer();

    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.status(200).send(output);
  } catch (error) {
    console.error('[compressor-tool] Error:', error.message);
    res.status(500).send('Image compression failed');
  }
}
