const fs = require('fs');
let c = fs.readFileSync('public/i18n/gov-bundle.js', 'utf8');

// Add government navigation i18n keys
// Check if already present
if (c.indexOf('gov.nav.myproblems') === -1) {
  // Add after gov.nav.consultations "Consultations",
  const oldLine = 'gov.nav.consultations "Consultations",';
  const newLine = 'gov.nav.consultations "Consultations",\ngov.nav.myproblems "My Problems",\ngov.nav.findsolutions "Find Solutions",\ngov.nav.solutions "Solution Evaluation",\ngov.nav.compliancecenter "Compliance Center",\ngov.nav.pilotmanagement "Pilot Management",\ngov.nav.pilotperformance "Pilot Performance",\ngov.nav.procurementreadiness "Procurement Readiness",\ngov.nav.scaleintelligence "Scale Intelligence",';
  c = c.replace(oldLine, newLine);
  fs.writeFileSync('public/i18n/gov-bundle.js', c);
  console.log('Added government navigation i18n keys');
} else {
  console.log('Government navigation keys already present');
}