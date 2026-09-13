const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createFavicon() {
  const inputPath = 'D:\\ProJect Development\\FullStackWeb for future (04-07-26)\\system-saas\\public\\resources\\avatar\\pama.png';
  const outputDir = 'D:\\ProJect Development\\FullStackWeb for future (04-07-26)\\system-saas\\public';

  try {
    const sizes = [16, 32, 48, 64, 128, 192, 256];
    
    for (const size of sizes) {
      await sharp(inputPath)
        .resize(size, size)
        .png()
        .toFile(path.join(outputDir, `icon-${size}.png`));
    }
    
    console.log('Multiple PNG favicons created successfully!');
  } catch (err) {
    console.error('Error:', err);
  }
}

createFavicon();
