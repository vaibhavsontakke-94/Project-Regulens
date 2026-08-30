const fs = require('fs');
let c = fs.readFileSync('public/i18n/gov-bundle.js', 'utf8');

// Add government navigation i18n keys
// Check if already present
if (c.indexOf('gov.nav.myproblems') === -1) {
  // Add after gov.nav.consultations
  const insertPoint = 'gov.nav.consultations "Consultations"';
  const newKeys = 'gov.nav.myproblems "My Problems",gov.nav.findsolutions "Find Solutions",gov.nav.solutions "Solution Evaluation",gov.nav.compliancecenter "Compliance Center",gov.nav.pilotmanagement "Pilot Management",gov.nav.pilotperformance "Pilot Performance",gov.nav.procurementreadiness "Procurement Readiness",gov.nav.scaleintelligence "Scale Intelligence"';
  c = c.replace(insertPoint, insertPoint + newKeys);
  fs.writeFileSync('public/i18n/gov-bundle.js', c);
  console.log('Added government navigation i18n keys');
} else {
  console.log('Government navigation keys already present');
}