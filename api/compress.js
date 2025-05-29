const sharp = require('sharp');
const axios = require('axios');

module.exports = async (req, res) => {
  const { image_url, format = 'webp', quality = 75 } = req.query;

  if (!image_url) {
    res.status(400).send('Missing image_url parameter');
    return;
  }

  try {
    const response = await axios.get(image_url, {
      responseType: 'arraybuffer',
      timeout: 10000,
    });

    const inputBuffer = Buffer.from(response.data);
    let outputBuffer;

    if (format === 'jpeg') {
      outputBuffer = await sharp(inputBuffer)
        .jpeg({ quality: parseInt(quality) })
        .toBuffer();
      res.setHeader('Content-Type', 'image/jpeg');
    } else {
      outputBuffer = await sharp(inputBuffer)
        .webp({ quality: parseInt(quality) })
        .toBuffer();
      res.setHeader('Content-Type', 'image/webp');
    }

    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.status(200).send(outputBuffer);
  } catch (err) {
    console.error('Compression failed:', err.message);
    res.status(500).send('Error processing image');
  }
};
