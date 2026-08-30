const fs = require('fs');
const c = fs.readFileSync('public/government.js', 'utf8');
const lower = c.toLowerCase();
for (let i = 30120; i < 31200; i++) {
  if (lower[i] === 'c') {
    const s = c.substring(i, i + 50);
    if (s.toLowerCase().includes('cost')) {
      console.log((i - 30120) + ':', s.substring(0, 80));
    }
  }
}