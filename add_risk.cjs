const fs = require('fs');
let c = fs.readFileSync('public/government.js', 'utf8');

// Add Risk Analyzer i18n keys if not present
const riskI18nKeys = `
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
gov.risk.critical "Critical",
gov.risk.factors "Risk Factors",
gov.risk.evidence "Supporting Evidence",
gov.risk.explanation "Explanation",
gov.risk.noData "No risk data available - register business information to generate assessment";

// Check if already present
if (c.indexOf('gov.risk.title') === -1) {
  // Add after gov.scl keys (which we just added)
  const sclInsert = 'gov.scl.assumptions.trace "Modeled estimate with explicit assumption traces"';
  const sclReplace = sclInsert + riskI18nKeys;
  c = c.replace(sclInsert, sclReplace);
  console.log('Added Risk Analyzer i18n keys');
} else {
  console.log('Risk i18n keys already present');
}

// Now add the risk analysis view to the initScale function
// After the scale analysis initialization, add risk analysis

// Find the initScale function and add risk analysis after it
const initScaleFunc = \`function initScale(pkg) {
    if (!S.scaleResult) {
      post("/api/scale/analyze", govCtx()).then((resp) => {
        if (resp && !resp.error) {
          S.scaleAnalysis = resp.scaleAnalysis;
          S.scaleRecommendation = resp.recommendation;
          S.scaleFactors = resp.scaleAnalysis ? resp.scaleAnalysis.techMetrics : {};
          S.scaleKPIs = resp.scaleAnalysis ? resp.scaleAnalysis.impactKPIs : {};
          S.clearLabeledProjections = resp.scaleAnalysis ? resp.scaleAnalysis.clearLabeledProjections : {};
          S.scaleRecommendation = resp.recommendation;
          renderScale(S.pkg);
        }
      });
    } else {
      renderScale(pkg);
    }
  }
  
  function initRisk() {
    post("/api/gov/package", govCtx()).then((pkg) => {
      if (pkg && !pkg.error) {
        S.riskAnalysis = gov.analyzeRisks(pkg);
        renderRisk(S.pkg);
      }
    });
  }
  
  function renderRisk(pkg) {
    const analysis = S.riskAnalysis || {};
    const root = $("govRiskBody");
    if (!root) return;
    
    const riskFactors = analysis.factors || {};
    const severity = analysis.severity || "low";
    
    root.innerHTML = \`
      <div class="card risk-card">
        <div class="card-head">
          <h3 class="card-title">${esc(T("gov.risk.title"))}</h3>
          <span class="risk-severity">${esc(T("gov.risk.level", { level: T("gov.risk." + severity) }))}</span>
        </div>
        <div class="table-wrap">
          <table class="req-table risk-table">
            <thead>
              <tr>
                <th>${esc(T("gov.risk.factor"))}</th>
                <th>${esc(T("gov.risk.score"))}</th>
                <th>${esc(T("gov.risk.level"))}</th>
                <th>${esc(T("gov.risk.factors"))}</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(riskFactors).map(([key, f]) => \`
                <tr>
                  <td>${esc(T("gov.risk." + key))}</td>
                  <td>${f.score}/100</td>
                  <td>${esc(T("gov.risk." + (f.severity || "low")))}</td>
                  <td>${esc(f.factor || "—")}</td>
                </tr>\`).join("")}
            </tbody>
          </table>
        </div>
        <div class="risk-details">
          <p>${esc(T("gov.risk.evidence", { evidence: analysis.evidence || "—" }))}</p>
          <p>${esc(T("gov.risk.explanation", { explanation: analysis.explanation || "—" }))}</p>
        </div>
      </div>
    \`;
  }\``;

// Find the initScale function and insert risk analysis after it
// The initScale function starts with "function initScale"
const initScaleMarker = 'function initScale(pkg)';
if (c.includes(initScaleMarker)) {
  // Insert risk analysis after initScale
  const insertAfter = initScaleMarker + \`\`;
  const riskSection = \`
  \${initScaleMarker}
  
  function initRisk() {
    post("/api/gov/package", govCtx()).then((pkg) => {
      if (pkg && !pkg.error) {
        S.riskAnalysis = gov.analyzeRisks(pkg);
        renderRisk(S.pkg);
      }
    });
  }
  
  function renderRisk(pkg) {
    const analysis = S.riskAnalysis || {};
    const root = $("govRiskBody");
    if (!root) return;
    
    const riskFactors = analysis.factors || {};
    const severity = analysis.severity || "low";
    
    root.innerHTML = \`
      <div class="card risk-card">
        <div class="card-head">
          <h3 class="card-title">${esc(T("gov.risk.title"))}</h3>
          <span class="risk-severity">${esc(T("gov.risk.level", { level: T("gov.risk." + severity) }))}</span>
        </div>
        <div class="table-wrap">
          <table class="req-table risk-table">
            <thead>
              <tr>
                <th>${esc(T("gov.risk.factor"))}</th>
                <th>${esc(T("gov.risk.score"))}</th>
                <th>${esc(T("gov.risk.level"))}</th>
                <th>${esc(T("gov.risk.factors"))}</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(riskFactors).map(([key, f]) => \`
                <tr>
                  <td>${esc(T("gov.risk." + key))}</td>
                  <td>${f.score}/100</td>
                  <td>${esc(T("gov.risk." + (f.severity || "low")))}</td>
                  <td>${esc(f.factor || "—")}</td>
                </tr>\`).join("")}
            </tbody>
          </table>
        </div>
        <div class="risk-details">
          <p>${esc(T("gov.risk.evidence", { evidence: analysis.evidence || "—" }))}</p>
          <p>${esc(T("gov.risk.explanation", { explanation: analysis.explanation || "—" }))}</p>
        </div>
      </div>
    \`;`;
  
  c = c.replace(initScaleMarker, riskSection);
  console.log('Added Risk Analyzer functions');
} else {
  console.log('Could not find initScale marker');
}

fs.writeFileSync('public/government.js', c);
console.log('Done');