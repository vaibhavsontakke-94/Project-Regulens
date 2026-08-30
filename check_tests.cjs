const fs = require('fs');
const p = 'test';
console.log('exists:', fs.existsSync(p));
if (fs.existsSync(p)) {
  const files = fs.readdirSync(p);
  console.log('files count:', files.length);
  console.log('first 10:', files.slice(0, 10));
} else {
  console.log('test directory not found, checking package.json for test script...');
  const pkg = fs.readFileSync('package.json', 'utf8');
  const m = pkg.match(/"test"/);
  console.log('test in package.json:', m ? 'found' : 'not found');
}