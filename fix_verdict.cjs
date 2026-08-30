const fs = require('fs');
let c = fs.readFileSync('public/app.js', 'utf8');
const old = 'els.verdictText.textContent = !hasData\n          ? "Enter your company, product and target market above to generate a launch-readiness analysis."\n          : analysisData.company + " is " + readiness + "% ready to launch " + analysisData.product + " in " + analysisData.target +\n            ". " + (s.pending > 0 ? "Resolve the " + s.pending + " pending requirements before entering the market to reduce compliance risk." : "All requirements are addressed — you are ready to proceed.")';
const repl = 'els.verdictText.textContent = !hasData\n          ? "Start business registration to generate analysis."\n          : hasData ? "Business registered and verified" : "Complete your business profile for readiness assessment"';
if (c.includes(old)) {
  c = c.replace(old, repl);
  fs.writeFileSync('public/app.js', c);
  console.log('Replaced successfully');
} else {
  console.log('Pattern not found directly, searching...');
  // Try simpler search
  if (c.includes('verdictText.textContent = !hasData')) {
    console.log('Found verdictText.textContent line');
    // Find and replace the next few lines
    const lines = c.split('\n');
    let found = false;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('verdictText.textContent = !hasData') && !found) {
        found = true;
        // Replace this line and next 3 lines
        lines[i] = 'els.verdictText.textContent = !hasData\n          ? "Start business registration to generate analysis."';
        lines[i+1] = '          : hasData ? "Business registered and verified" : "Complete your business profile for readiness assessment"';
        lines[i+2] = '';
        lines[i+3] = '';
        break;
      }
    }
    fs.writeFileSync('public/app.js', lines.join('\n'));
    console.log('Replaced via line manipulation');
  } else {
    console.log('Pattern not found at all');
  }
}