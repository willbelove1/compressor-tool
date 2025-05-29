const fetch = require('node-fetch');
const sharp = require('sharp');

module.exports = async (req, res) => {
  try {
    const { image_url } = req.query;

    if (!image_url) {
      return res.status(400).send('Missing image_url');
    }

    const response = await fetch(image_url);
    if (!response.ok) {
      return res.status(406).send('Failed to fetch image');
    }

    const buffer = await response.buffer();

    const output = await sharp(buffer)
      .jpeg({ quality: 50 }) // Nén xuống còn 50% chất lượng
      .toBuffer();

    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.send(output);

  } catch (err) {
    console.error(err);
    return res.status(500).send('Compression failed');
  }
};
