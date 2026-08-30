const fs = require('fs');
const c = fs.readFileSync('public/app.js', 'utf8');
const lines = c.split('\n');
for (let i = 4680; i < 4720; i++) {
  if (lines[i]) {
    console.log((i+1) + ':', lines[i].substring(0, 150));
  }
}