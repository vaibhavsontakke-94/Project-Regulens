const fs = require('fs');
let c = fs.readFileSync('public/i18n/gov-bundle.js', 'utf8');

// Add Risk Analyzer i18n keys
const riskI18n = `
gov.risk.title "Risk Analysis",
gov.risk.regulatory "Regulatory",
gov.risk.financial "Financial",
gov.risk.operational "Operational",
gov.risk.technology "Technology",
gov.risk.compliance "Compliance",
gov.risk.level "Risk Level",
gov.risk.low "Low",
gov.risk.medium "Medium",
gov.risk.high "High",
gov.risk.critical "Critical"
`;

// Check if already present
if (c.indexOf('gov.risk.title') === -1) {
  // Add after gov.scl.assumptions.trace
  const insertPoint = 'gov.scl.assumptions.trace "Modeled estimate with explicit assumption traces"';
  c = c.replace(insertPoint, insertPoint + riskI18n);
  fs.writeFileSync('public/i18n/gov-bundle.js', c);
  console.log('Added Risk Analyzer i18n keys');
} else {
  console.log('Already present');
}