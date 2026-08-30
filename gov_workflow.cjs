const fs = require('fs');
const c = fs.readFileSync('public/government.js', 'utf8');
const lines = c.split('\n');
let inWorkflow = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('gov-workflow') || lines[i].includes('Government Workflow') || lines[i].includes('workflow')) {
    inWorkflow = true;
  }
  if (inWorkflow) {
    console.log((i + 1) + ':', lines[i].substring(0, 150));
    if (i > 500 && lines[i].includes('</div>')) break;
  }
}