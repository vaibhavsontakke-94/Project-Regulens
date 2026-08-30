const fs = require('fs');
let c = fs.readFileSync('public/i18n/gov-bundle.js', 'utf8');

// Add scalability i18n keys near the existing gov.sih keys
// Find the location after gov.sih.q14 and add scalability keys
const insertPoint = 'gov.sih.q14';
const newKeys = `
gov.scl.title "Solution Scalability",
gov.scl.level "Current Scalability Level",
gov.scl.levels "Levels",
gov.scl.levels.pilot "Pilot",
gov.scl.levels.local "Local",
gov.scl.levels.district "District",
gov.scl.levels.state "State",
gov.scl.levels.national "National",
gov.scl.factor "Factor",
gov.scl.score "Score",
gov.scl.label "Label",
gov.scl.description "Description",
gov.scl.assumptions "Assumptions",
gov.scl.kpiUsers "Users Impacted",
gov.scl.kpiCostSaving "Cost Saving",
gov.scl.kpiEfficiency "Efficiency",
gov.scl.kpiSatisfaction "Satisfaction",
gov.scl.assumptions.trace "Modeled estimate with explicit assumption traces"
`;

// Check if already present
if (c.indexOf('gov.scl.title') === -1) {
  c = c.replace(insertPoint, insertPoint + newKeys);
  fs.writeFileSync('public/i18n/gov-bundle.js', c);
  console.log('Added scalability i18n keys');
} else {
  console.log('Keys already present');
}