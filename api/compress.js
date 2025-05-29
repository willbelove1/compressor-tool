const sharp = require('sharp');
const axios = require('axios');

module.exports = async (req, res) => {
  const { image_url, format = 'webp', quality = 75 } = req.query;

  console.log(`[Request] image_url=${image_url}, format=${format}, quality=${quality}`);

  if (!image_url) {
    console.error('[Error] Missing image_url');
    res.status(400).json({ error: 'Missing required parameter: image_url' });
    return;
  }

  try {
    const parsedQuality = parseInt(quality);
    if (isNaN(parsedQuality) || parsedQuality < 1 || parsedQuality > 100) {
      console.error('[Error] Invalid quality value');
      res.status(400).json({ error: 'Invalid quality value. Must be a number from 1 to 100.' });
      return;
    }

    const imageResp = await axios.get(image_url, {
      responseType: 'arraybuffer',
      timeout: 10000,
    });

    const inputBuffer = Buffer.from(imageResp.data);
    let outputBuffer;

    if (format === 'jpeg') {
      console.log('[Info] Compressing to JPEG...');
      outputBuffer = await sharp(inputBuffer).jpeg({ quality: parsedQuality }).toBuffer();
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (format === 'webp') {
      console.log('[Info] Compressing to WebP...');
      outputBuffer = await sharp(inputBuffer).webp({ quality: parsedQuality }).toBuffer();
      res.setHeader('Content-Type', 'image/webp');
    } else {
      console.error('[Error] Unsupported format:', format);
      res.status(400).json({ error: `Unsupported format: ${format}. Use 'webp' or 'jpeg'.` });
      return;
    }

    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.status(200).send(outputBuffer);
  } catch (err) {
    console.error('[Exception]', err.message);

    // Phân loại lỗi để phản hồi chính xác hơn
    if (err.code === 'ECONNABORTED') {
      res.status(504).json({ error: 'Image download timeout' });
    } else if (err.response && err.response.status === 404) {
      res.status(404).json({ error: 'Image not found at provided URL' });
    } else if (err.message.includes('Input buffer contains unsupported image format')) {
      res.status(415).json({ error: 'Unsupported image format' });
    } else {
      res.status(500).json({ error: 'Internal server error', detail: err.message });
    }
  }
};
