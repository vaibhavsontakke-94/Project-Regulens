const fs = require('fs');
const c = fs.readFileSync('public/sih-startup.js', 'utf8');
const lines = c.split('\n');
let count = 0;
for (let i = 0; i < lines.length && count < 40; i++) {
  const line = lines[i];
  const lower = line.toLowerCase();
  if (lower.includes('key') || lower.includes('label') || lower.includes('type') ||
      lower.includes('placeholder') || lower.includes('name') ||
      (/^\s*\d+/.test(line) && line.includes(':'))) {
    console.log((i + 1) + ':', line.substring(0, 120));
    count++;
  }
}