// api/compress.js
const sharp = require('sharp');
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const { image_url, quality = 70 } = req.query;

  if (!image_url) {
    return res.status(400).json({ error: 'Missing image_url parameter' });
  }

  try {
    const response = await fetch(image_url);

    if (!response.ok) {
      return res.status(406).json({ error: 'Unable to fetch image' });
    }

    const buffer = await response.buffer();
    const compressedBuffer = await sharp(buffer)
      .jpeg({ quality: parseInt(quality, 10), mozjpeg: true })
      .toBuffer();

    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    return res.status(200).send(compressedBuffer);
  } catch (error) {
    console.error('Compression error:', error);
    return res.status(500).json({ error: 'Compression failed' });
  }
};
