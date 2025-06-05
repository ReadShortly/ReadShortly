// Simple Node.js script using canvas to generate PNG icons
// To run: npm install canvas
// Then: node generate_pngs.js

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Ensure icons directory exists
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Helper function to draw rounded rectangle
function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// Function to create icon
function createIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#1877F2'; // Facebook blue
  drawRoundedRect(ctx, 0, 0, size, size, size / 8);
  ctx.fill();
  
  // Text "RS"
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size / 2}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('RS', size / 2, size / 2);
  
  // Only add checkmark if icon is big enough
  if (size >= 48) {
    // Checkmark
    ctx.strokeStyle = 'white';
    ctx.lineWidth = size / 20;
    ctx.beginPath();
    ctx.moveTo(size * 0.25, size * 0.6);
    ctx.lineTo(size * 0.4, size * 0.75);
    ctx.lineTo(size * 0.75, size * 0.35);
    ctx.stroke();
  }
  
  // Save to file
  const buffer = canvas.toBuffer('image/png');
  const filePath = path.join(iconsDir, `icon${size}.png`);
  fs.writeFileSync(filePath, buffer);
  console.log(`Created ${filePath}`);
}

// Create icons of different sizes
[16, 48, 128].forEach(size => createIcon(size));

console.log('\nAll icons created successfully! Now your extension should load properly.'); 