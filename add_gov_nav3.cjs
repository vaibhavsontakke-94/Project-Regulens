const fs = require('fs');
let c = fs.readFileSync('public/i18n/gov-bundle.js', 'utf8');

// Add government navigation i18n keys
// Check if already present
if (c.indexOf('gov.nav.myproblems') === -1) {
  // The i18n format is "key": "value", so we need to match the JSON format
  // Find gov.nav.consultations and add after it
  const pattern = '"gov.nav.consultations": "Consultations",';
  const newItems = '\n  "gov.nav.myproblems": "My Problems",\n  "gov.nav.findsolutions": "Find Solutions",\n  "gov.nav.solutions": "Solution Evaluation",\n  "gov.nav.compliancecenter": "Compliance Center",\n  "gov.nav.pilotmanagement": "Pilot Management",\n  "gov.nav.pilotperformance": "Pilot Performance",\n  "gov.nav.procurementreadiness": "Procurement Readiness",\n  "gov.nav.scaleintelligence": "Scale Intelligence"';
  c = c.replace(pattern, pattern + newItems);
  fs.writeFileSync('public/i18n/gov-bundle.js', c);
  console.log('Added government navigation i18n keys');
} else {
  console.log('Government navigation keys already present');
}