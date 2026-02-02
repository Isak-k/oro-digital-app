const sharp = require('sharp');
const toIco = require('to-ico');
const fs = require('fs');

async function convertToIco() {
  try {
    // Check if the new logo file exists
    if (!fs.existsSync('new-logo.png')) {
      console.log('Please save your uploaded logo as "new-logo.png" in the project root first.');
      console.log('Then run: node convert-to-ico.js');
      return;
    }

    console.log('Converting logo to ICO format...');

    // Create different sizes for the ICO file
    const sizes = [16, 32, 48];
    const pngBuffers = [];

    for (const size of sizes) {
      const buffer = await sharp('new-logo.png')
        .resize(size, size)
        .png()
        .toBuffer();
      pngBuffers.push(buffer);
    }

    // Convert to ICO
    const icoBuffer = await toIco(pngBuffers);
    
    // Save the ICO file
    fs.writeFileSync('public/favicon.ico', icoBuffer);
    
    console.log('✅ Successfully created favicon.ico in the public folder!');
    console.log('The favicon has been replaced with your new logo.');
    
  } catch (error) {
    console.error('❌ Error converting image:', error);
    console.log('\n📝 Alternative: You can use an online converter:');
    console.log('1. Go to https://favicon.io/favicon-converter/');
    console.log('2. Upload your logo image');
    console.log('3. Download the favicon.ico file');
    console.log('4. Replace the file in public/favicon.ico');
  }
}

convertToIco();