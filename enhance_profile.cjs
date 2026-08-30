const fs = require('fs');
let c = fs.readFileSync('public/government.js', 'utf8');

// Readable replacements - just replace the exact strings in the code
// 1. Enhance the business field in 01-register stage - replace the old business definition
// Old: business: pkgCtx.company ? { name: pkgCtx.company } : null
// New: business: pkgCtx.company ? { name: pkgCtx.company, industry: pkgCtx.industryName || "Not specified", product: pkgCtx.product || "Not specified", teamSize: pkgCtx.teamSize || "Not specified", experienceYears: pkgCtx.experienceYears || "Not specified", certifications: pkgCtx.certifications || "Not recorded" } : null

c = c.replace(
  'business: pkgCtx.company ? { name: pkgCtx.company } : null',
  'business: pkgCtx.company ? { name: pkgCtx.company, industry: pkgCtx.industryName || "Not specified", product: pkgCtx.product || "Not specified", teamSize: pkgCtx.teamSize || "Not specified", experienceYears: pkgCtx.experienceYears || "Not specified", certifications: pkgCtx.certifications || "Not recorded" } : null'
);

// 2. Enhance the cta in 01-register stage
c = c.replace('cta: "Register Business",', 'cta: "View Profile",');

// 3. Enhance the 03-gov-problem problem field
// Old: problem: pkgCtx.targetName ? { name: pkgCtx.targetName } : null
// This is already fine, but let me ensure it's correct

// 4. Enhance 04-ai-matching businesses
// Old: businesses: []
// New: businesses: pkgCtx.matchedBusinesses || []
c = c.replace('businesses: [],', 'businesses: pkgCtx.matchedBusinesses || []');

// 5. Enhance 05-select-business businesses
// Old: businesses: []
// New: businesses: pkgCtx.selectedBusiness ? [pkgCtx.selectedBusiness] : []
c = c.replace('businesses: [],', 'businesses: pkgCtx.selectedBusiness ? [pkgCtx.selectedBusiness] : []');

// 6. Update remaining stage CTAs to be more descriptive
c = c.replace('cta: "Review Solutions",', 'cta: "Review Solutions",');
c = c.replace('cta: "Analyze",', 'cta: "View Analysis",');
c = c.replace('cta: "Make Decision",', 'cta: "Make Decision",');
c = c.replace('cta: "Run Scenarios",', 'cta: "Run Scenarios",');
c = c.replace('cta: "Manage Pilot",', 'cta: "Manage Pilot",');
c = c.replace('cta: "Check Readiness",', 'cta: "Check Readiness",');
c = c.replace('cta: "Scale Analysis",', 'cta: "Scale Analysis",');

console.log('Replacements complete, writing file...');
fs.writeFileSync('public/government.js', c);
console.log('Done');