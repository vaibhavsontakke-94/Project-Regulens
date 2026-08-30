const fs = require('fs');
const c = fs.readFileSync('server.js', 'utf8');
const idx = c.indexOf('/api/gov/copilot');
if (idx > -1) {
  console.log(c.substring(idx, idx + 2000));
} else {
  console.log('Not found');
}