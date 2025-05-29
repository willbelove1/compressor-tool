const fetch = require('node-fetch');
const sharp = require('sharp');

module.exports = async (req, res) => {
  try {
    const { image_url } = req.query;

    if (!image_url) {
      return res.status(400).send('Missing image_url');
    }

    // Fetch ảnh gốc
    const response = await fetch(image_url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'image/*,*/*'
      }
    });

    if (!response.ok) {
      return res.status(406).send(`Failed to fetch image: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.buffer();

    // Nén ảnh
    const output = await sharp(buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .jpeg({ quality: 60 })
      .toBuffer();

    // Trả về ảnh
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.status(200).send(output);
    
  } catch (err) {
    console.error('[Compression Error]', err);
    return res.status(500).send('Internal Server Error');
  }
};
