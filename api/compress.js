import fetch from 'node-fetch';
import sharp from 'sharp';

export default async function handler(req, res) {
  try {
    const { image_url } = req.query;

    // 🧪 Log: Nhận đầu vào
    console.log('[Request]', image_url);

    // 🚫 Kiểm tra thiếu hoặc sai định dạng URL
    if (!image_url || !/^https?:\/\//i.test(image_url)) {
      console.error('[Validation Error] Invalid or missing image_url:', image_url);
      return res.status(400).json({ error: 'Invalid or missing image_url' });
    }

    // 📥 Tải ảnh gốc
    const response = await fetch(image_url);
    if (!response.ok) {
      console.error('[Fetch Error]', response.status, image_url);
      return res.status(406).json({ error: 'Failed to fetch original image' });
    }

    const buffer = await response.buffer();

    // 🧊 Nén ảnh với sharp
    const compressed = await sharp(buffer)
      .jpeg({ quality: 50 })
      .toBuffer();

    // 📤 Gửi ảnh nén
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.status(200).send(compressed);

    // ✅ Log: Thành công
    console.log('[Success] Image compressed and sent');

  } catch (error) {
    // 🛠️ Bắt lỗi toàn cục
    console.error('[Compression Error]', error);
    res.status(500).json({ error: 'Image compression failed' });
  }
}
