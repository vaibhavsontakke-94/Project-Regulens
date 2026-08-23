/* ───────── deterministic demo analysis engine ─────────
   Generates realistic regulatory analysis based on industry + market
   WITHOUT requiring any external AI. Uses lib/regulens-core.cjs for
   readiness, action enrichment, timeline, sources and canLaunch so
   demo and live pipelines share ONE set of algorithms. */
import core from "./regulens-core.cjs";

const REG_DB = {
  fintech: {
    us: [
      { id: "us-fincen", title: "Bank Secrecy Act (BSA)", authority: "FinCEN", kind: "Existing", code: "31 USC §5311", summary: "Anti-money laundering and customer identification requirements for financial institutions.", source: "Financial Crimes Enforcement Network", confidence: "high", impact: "high", impactTitle: "AML Compliance Program", impactDesc: "Requires comprehensive AML program, SAR filing, and CTR reporting." },
      { id: "us-gramm", title: "Gramm-Leach-Bliley Act", authority: "FTC", kind: "Existing", code: "15 USC §6801", summary: "Financial privacy rules requiring privacy notices and data security safeguards.", source: "Federal Trade Commission", confidence: "high", impact: "high", impactTitle: "Privacy Program", impactDesc: "Requires privacy policy, data security program, and annual notices." },
      { id: "us-reg-e", title: "Regulation E", authority: "CFPB", kind: "Existing", code: "12 CFR §1005", summary: "Electronic Fund Transfer Act implementing consumer protections for electronic payments.", source: "Consumer Financial Protection Bureau", confidence: "high", impact: "medium", impactTitle: "Consumer Protections", impactDesc: "Requires error resolution, unauthorized transfer protections, and disclosures." },
      { id: "us-sox", title: "Sarbanes-Oxley Act §404", authority: "SEC", kind: "Existing", code: "15 USC §7262", summary: "Internal controls and financial reporting requirements for public companies.", source: "Securities and Exchange Commission", confidence: "medium", impact: "medium", impactTitle: "Internal Controls", impactDesc: "SOX compliance may be required depending on company size and listing status." },
      { id: "us-ccpa", title: "California Consumer Privacy Act", authority: "CA AG", kind: "Existing", code: "Cal. Civ. Code §1798.100", summary: "Consumer data rights including access, deletion, and opt-out of data sale.", source: "California Attorney General", confidence: "high", impact: "high", impactTitle: "Data Privacy Rights", impactDesc: "Requires privacy policy, consumer request processes, and data mapping." },
      { id: "us-ecfa", title: "Electronic Fund Transfer Act", authority: "CFPB", kind: "Existing", code: "15 USC §1693", summary: "Framework for electronic payment services including prepaid accounts.", source: "Consumer Financial Protection Bureau", confidence: "high", impact: "medium", impactTitle: "Payment Framework", impactDesc: "Defines rights and liabilities for electronic fund transfers." },
    ],
    in: [
      { id: "in-rbi-pa", title: "RBI Payment Aggregator Guidelines", authority: "RBI", kind: "Existing", code: "DPSS.PPI.GoR.No.1886", summary: "Licensing and operational requirements for payment aggregators.", source: "Reserve Bank of India", confidence: "high", impact: "high", impactTitle: "PA License", impactDesc: "Mandatory authorization for payment aggregation services from RBI." },
      { id: "in-rbi-nbfc", title: "RBI Guidelines for NBFC-Fintech", authority: "RBI", kind: "Existing", code: "RBI/2023-24/46", summary: "Digital lending framework for NBFCs and fintech entities.", source: "Reserve Bank of India", confidence: "high", impact: "high", impactTitle: "NBFC Compliance", impactDesc: "Registration, capital adequacy, and reporting requirements." },
      { id: "in-pdpb", title: "Digital Personal Data Protection Act", authority: "MeitY", kind: "New", code: "Act No. 22 of 2023", summary: "Comprehensive data protection law governing collection, processing, and storage of personal data.", source: "Ministry of Electronics and IT", confidence: "high", impact: "high", impactTitle: "Data Protection", impactDesc: "Consent requirements, data localization, breach notification, and DPO appointment." },
      { id: "in-it-act", title: "Information Technology Act 2000", authority: "MeitY", kind: "Existing", code: "Act 21 of 2000", summary: "Framework for electronic transactions, digital signatures, and cybersecurity.", source: "Ministry of Electronics and IT", confidence: "high", impact: "medium", impactTitle: "IT Compliance", impactDesc: "Reasonable security practices, data retention, and intermediary guidelines." },
      { id: "in-rbi-kyc", title: "RBI KYC Direction 2016", authority: "RBI", kind: "Existing", code: "DBOD.AML.BC.No.81", summary: "Customer due diligence and know-your-customer requirements for financial institutions.", source: "Reserve Bank of India", confidence: "high", impact: "high", impactTitle: "KYC Program", impactDesc: "Video KYC, eKYC, document verification, and ongoing monitoring." },
      { id: "in-rbi-data", title: "RBI Data Localization Guidelines", authority: "RBI", kind: "Existing", code: "RBI/2017-17/153", summary: "Mandates storage of payment data exclusively within India.", source: "Reserve Bank of India", confidence: "high", impact: "high", impactTitle: "Data Localization", impactDesc: "All payment system data must be stored in India with no cross-border mirroring." },
    ],
    de: [
      { id: "de-ecba", title: "EU Payment Services Directive (PSD2)", authority: "BaFin", kind: "Existing", code: "Directive 2015/2366", summary: "Open banking framework and payment service licensing requirements.", source: "Federal Financial Supervisory Authority (BaFin)", confidence: "high", impact: "high", impactTitle: "PSD2 License", impactDesc: "Requires authorization as payment institution with capital and governance requirements." },
      { id: "de-gdpr", title: "General Data Protection Regulation", authority: "EU/DSK", kind: "Existing", code: "Regulation 2016/679", summary: "EU-wide data protection framework with strict consent and processing requirements.", source: "European Union", confidence: "high", impact: "high", impactTitle: "GDPR Compliance", impactDesc: "DPO appointment, DPIA, consent management, breach notification within 72 hours." },
      { id: "de-mifid", title: "MiFID II", authority: "BaFin", kind: "Existing", code: "Directive 2014/65/EU", summary: "Markets in Financial Instruments Directive governing investment services.", source: "BaFin / European Securities and Markets Authority", confidence: "high", impact: "medium", impactTitle: "Investment Services", impactDesc: "Applicable if offering investment products or advisory services." },
      { id: "de-aml", title: "EU Anti-Money Laundering Directive (AMLD6)", authority: "EU", kind: "Existing", code: "Directive 2024/1640", summary: "Latest EU AML requirements including beneficial ownership and crypto-asset coverage.", source: "European Commission", confidence: "high", impact: "high", impactTitle: "AML Framework", impactDesc: "CDD, transaction monitoring, suspicious activity reporting." },
      { id: "de-eidass", title: "eIDAS Regulation", authority: "EU", kind: "Existing", code: "Regulation 910/2014", summary: "Framework for electronic identification and trust services.", source: "European Commission", confidence: "medium", impact: "medium", impactTitle: "eIDAS Compliance", impactDesc: "Qualified electronic signatures and trust service provider requirements." },
    ],
    uk: [
      { id: "uk-pca", title: "Payment Services Regulations 2017", authority: "FCA", kind: "Existing", code: "SI 2017/752", summary: "UK payment services licensing and open banking framework.", source: "Financial Conduct Authority", confidence: "high", impact: "high", impactTitle: "PSR License", impactDesc: "Authorization as authorized payment institution or e-money institution." },
      { id: "uk-ukgdpr", title: "UK GDPR", authority: "ICO", kind: "Existing", code: "Data Protection Act 2018", summary: "UK post-Brexit data protection framework mirroring EU GDPR.", source: "Information Commissioner's Office", confidence: "high", impact: "high", impactTitle: "UK Data Protection", impactDesc: "Registration with ICO, DPIA, and data protection officer." },
      { id: "uk-fca", title: "FCA Conduct of Business Rules", authority: "FCA", kind: "Existing", code: "FCA COBS", summary: "Conduct standards for financial services firms including fair treatment of customers.", source: "Financial Conduct Authority", confidence: "high", impact: "high", impactTitle: "FCA Conduct", impactDesc: "Consumer duty, product governance, and financial promotions rules." },
      { id: "uk-amls", title: "Money Laundering Regulations 2017", authority: "HMRC/FCA", kind: "Existing", code: "SI 2017/692", summary: "UK AML/CFT requirements for regulated firms.", source: "HM Revenue & Customs", confidence: "high", impact: "high", impactTitle: "AML Program", impactDesc: "Customer due diligence, ongoing monitoring, and suspicious activity reporting." },
    ],
  },
  healthcare: {
    de: [
      { id: "de-mdr", title: "EU Medical Device Regulation (MDR)", authority: "BfArM", kind: "Existing", code: "Regulation 2017/745", summary: "Comprehensive framework for medical device classification, CE marking, and post-market surveillance.", source: "Federal Institute for Drugs and Medical Devices (BfArM)", confidence: "high", impact: "high", impactTitle: "MDR Certification", impactDesc: "Classification, notified body assessment, clinical evaluation, UDI registration." },
      { id: "de-ivdr", title: "EU In Vitro Diagnostic Regulation", authority: "BfArM", kind: "Existing", code: "Regulation 2017/746", summary: "Regulation of in vitro diagnostic medical devices.", source: "BfArM / EU", confidence: "high", impact: "high", impactTitle: "IVDR Compliance", impactDesc: "Classification, performance studies, and market surveillance requirements." },
      { id: "de-gdpr-health", title: "GDPR Health Data Processing", authority: "DSK", kind: "Existing", code: "GDPR Art. 9", summary: "Special protections for health data processing including explicit consent requirements.", source: "German Data Protection Conference", confidence: "high", impact: "high", impactTitle: "Health Data Protection", impactDesc: "DPIA required, DPO mandatory, explicit consent for health data processing." },
      { id: "de-hds", title: "Hospital Data Protection Ordinance", authority: "BMG", kind: "Existing", code: "KHEntlG", summary: "Specific data protection requirements for hospital information systems.", source: "Federal Ministry of Health", confidence: "high", impact: "high", impactTitle: "Hospital IT Security", impactDesc: "TEG certification, IT security concepts, data protection officers." },
      { id: "de-amg", title: "German Medicinal Products Act", authority: "BfArM", kind: "Existing", code: "AMG §4", summary: "Regulation of medicinal products including digital health applications (DiGA).", source: "Federal Institute for Drugs and Medical Devices", confidence: "high", impact: "medium", impactTitle: "DiGA Framework", impactDesc: "If app qualifies as medical device, fast-track approval pathway available." },
    ],
    us: [
      { id: "us-hitrust", title: "HIPAA Privacy Rule", authority: "HHS/OCR", kind: "Existing", code: "45 CFR Part 160, 164", summary: "Protection of individually identifiable health information.", source: "Department of Health and Human Services", confidence: "high", impact: "high", impactTitle: "HIPAA Privacy", impactDesc: "Minimum necessary standard, patient rights, business associate agreements." },
      { id: "us-hipaa-sec", title: "HIPAA Security Rule", authority: "HHS/OCR", kind: "Existing", code: "45 CFR 164.302", summary: "Administrative, physical, and technical safeguards for ePHI.", source: "Department of Health and Human Services", confidence: "high", impact: "high", impactTitle: "HIPAA Security", impactDesc: "Risk assessment, access controls, encryption, audit logging, incident response." },
      { id: "us-fda-samd", title: "FDA Software as Medical Device", authority: "FDA", kind: "Existing", code: "FDA guidance", summary: "Classification and regulatory pathway for clinical software.", source: "Food and Drug Administration", confidence: "high", impact: "high", impactTitle: "SaMD Classification", impactDesc: "Device classification, premarket submission, quality system requirements." },
      { id: "us-hitech", title: "HITECH Act", authority: "HHS", kind: "Existing", code: "42 USC §17921", summary: "Health Information Technology for Economic and Clinical Health Act.", source: "Department of Health and Human Services", confidence: "high", impact: "medium", impactTitle: "HITECH Compliance", impactDesc: "Breach notification, enhanced penalties, EHR incentives." },
      { id: "us-21cfr", title: "21 CFR Part 11", authority: "FDA", kind: "Existing", code: "21 CFR Part 11", summary: "Electronic records and electronic signatures requirements.", source: "Food and Drug Administration", confidence: "high", impact: "high", impactTitle: "Electronic Records", impactDesc: "System validation, audit trails, electronic signature controls." },
    ],
    in: [
      { id: "in-abc", title: "ABDM Health Data Exchange", authority: "NHA", kind: "New", code: "ABDM Framework", summary: "Ayushman Bharat Digital Mission health data exchange standards.", source: "National Health Authority", confidence: "high", impact: "high", impactTitle: "ABDM Integration", impactDesc: "Health ID, health records exchange, consent manager registration." },
      { id: "in-it-health", title: "IT Act - Health Data Rules", authority: "MeitY", kind: "Existing", code: "IT Act 2000", summary: "Information technology rules applicable to health data processing.", source: "Ministry of Electronics and IT", confidence: "medium", impact: "medium", impactTitle: "IT Compliance", impactDesc: "Reasonable security practices, data retention rules." },
      { id: "in-cdSCO", title: "Medical Device Rules 2017", authority: "CDSCO", kind: "Existing", code: "GSR 841(E)", summary: "Classification and registration of medical devices in India.", source: "Central Drugs Standard Control Organization", confidence: "high", impact: "high", impactTitle: "Device Registration", impactDesc: "License application, quality management system, import license." },
      { id: "in-pdpb-health", title: "DPDP Act - Health Provisions", authority: "MeitY", kind: "New", code: "Act 22 of 2023", summary: "Digital personal data protection requirements for health data.", source: "Ministry of Electronics and IT", confidence: "high", impact: "high", impactTitle: "Data Protection", impactDesc: "Consent requirements, data fiduciary obligations, cross-border transfer rules." },
    ],
    uk: [
      { id: "uk-mhra", title: "UK Medical Devices Regulations", authority: "MHRA", kind: "Existing", code: "SI 2002/618", summary: "UK medical device registration and conformity assessment post-Brexit.", source: "Medicines and Healthcare products Regulatory Agency", confidence: "high", impact: "high", impactTitle: "UKCA Marking", impactDesc: "UKCA marking, MHRA registration, conformity assessment." },
      { id: "uk-dpa", title: "UK Data Protection Act 2018", authority: "ICO", kind: "Existing", code: "DPA 2018", summary: "UK data protection framework for health data.", source: "Information Commissioner's Office", confidence: "high", impact: "high", impactTitle: "Data Protection", impactDesc: "ICO registration, DPIA, and health data specific conditions." },
      { id: "uk-nis", title: "NIS Regulations", authority: "DSIT", kind: "Existing", code: "SI 2018/506", summary: "Network and information systems security for essential services.", source: "Department for Science, Innovation and Technology", confidence: "medium", impact: "medium", impactTitle: "Cyber Security", impactDesc: "Security requirements for digital service providers." },
    ],
  },
  edtech: {
    us: [
      { id: "us-ferpa", title: "FERPA", authority: "DOE", kind: "Existing", code: "20 USC §1232g", summary: "Family Educational Rights and Privacy Act protecting student education records.", source: "Department of Education", confidence: "high", impact: "high", impactTitle: "Student Privacy", impactDesc: "Consent for disclosure, directory information rules, parent rights." },
      { id: "us-coppa", title: "COPPA", authority: "FTC", kind: "Existing", code: "16 CFR Part 312", summary: "Children's Online Privacy Protection Act for users under 13.", source: "Federal Trade Commission", confidence: "high", impact: "high", impactTitle: "Children's Privacy", impactDesc: "Parental consent, data minimization, deletion rights for minors." },
      { id: "us-ada", title: "ADA Title III", authority: "DOJ", kind: "Existing", code: "42 USC §12181", summary: "Americans with Disabilities Act requiring accessible digital services.", source: "Department of Justice", confidence: "high", impact: "medium", impactTitle: "Accessibility", impactDesc: "WCAG 2.1 AA compliance, screen reader support, accessible content." },
      { id: "us-ccpa-ed", title: "CCPA/CPRA", authority: "CA AG", kind: "Existing", code: "Cal. Civ. Code §1798.100", summary: "Consumer data rights applicable to EdTech platforms.", source: "California Privacy Protection Agency", confidence: "high", impact: "medium", impactTitle: "Privacy Rights", impactDesc: "Consumer rights, data sale opt-out, privacy policy requirements." },
    ],
    in: [
      { id: "in-nep", title: "National Education Policy 2020", authority: "MoE", kind: "New", code: "NEP 2020", summary: "Framework for digital education standards and technology integration.", source: "Ministry of Education", confidence: "medium", impact: "medium", impactTitle: "NEP Compliance", impactDesc: "Digital infrastructure standards, content quality guidelines." },
      { id: "in-it-ed", title: "IT Act - EdTech Rules", authority: "MeitY", kind: "Existing", code: "IT Act 2000", summary: "Data protection and content regulations for educational technology.", source: "Ministry of Electronics and IT", confidence: "medium", impact: "medium", impactTitle: "IT Compliance", impactDesc: "Content moderation, data retention, intermediary guidelines." },
      { id: "in-pdpb-ed", title: "DPDP Act - Student Data", authority: "MeitY", kind: "New", code: "Act 22 of 2023", summary: "Data protection requirements specifically for student/children data.", source: "Ministry of Electronics and IT", confidence: "high", impact: "high", impactTitle: "Student Data Protection", impactDesc: "Verifiable parental consent, data minimization, purpose limitation." },
    ],
    de: [
      { id: "de-gdpr-ed", title: "GDPR - Education Data", authority: "DSK", kind: "Existing", code: "GDPR", summary: "Data protection requirements for educational platforms in EU.", source: "German Data Protection Conference", confidence: "high", impact: "high", impactTitle: "GDPR Education", impactDesc: "Consent, DPIA, school-specific data processing agreements." },
      { id: "de-ddsg", title: "Digital Infrastructure in Schools Act", authority: "BSB", kind: "Existing", code: "DigiPaktSchule", summary: "Standards for digital education infrastructure and platforms.", source: "Federal School Board", confidence: "medium", impact: "medium", impactTitle: "Digital Infrastructure", impactDesc: "Data sovereignty, German hosting requirements for school platforms." },
    ],
  },
};

const INDUSTRY_DEFAULTS = {
  fintech: { riskBase: "High", costMultiplier: 1.2, timeMultiplier: 1.1, baseDays: 90, baseCost: 25000 },
  healthcare: { riskBase: "High", costMultiplier: 1.5, timeMultiplier: 1.3, baseDays: 120, baseCost: 45000 },
  edtech: { riskBase: "Medium", costMultiplier: 0.8, timeMultiplier: 0.9, baseDays: 60, baseCost: 15000 },
  ecommerce: { riskBase: "Medium", costMultiplier: 0.9, timeMultiplier: 0.8, baseDays: 45, baseCost: 12000 },
  saas: { riskBase: "Medium", costMultiplier: 0.7, timeMultiplier: 0.8, baseDays: 40, baseCost: 10000 },
  "ai-ml": { riskBase: "High", costMultiplier: 1.3, timeMultiplier: 1.2, baseDays: 100, baseCost: 30000 },
  manufacturing: { riskBase: "Medium", costMultiplier: 1.1, timeMultiplier: 1.0, baseDays: 80, baseCost: 20000 },
  retail: { riskBase: "Low", costMultiplier: 0.6, timeMultiplier: 0.7, baseDays: 30, baseCost: 8000 },
  "food-beverage": { riskBase: "High", costMultiplier: 1.0, timeMultiplier: 1.0, baseDays: 70, baseCost: 18000 },
  logistics: { riskBase: "Medium", costMultiplier: 0.9, timeMultiplier: 0.9, baseDays: 55, baseCost: 14000 },
  energy: { riskBase: "High", costMultiplier: 1.4, timeMultiplier: 1.3, baseDays: 110, baseCost: 35000 },
  automotive: { riskBase: "Medium", costMultiplier: 1.2, timeMultiplier: 1.1, baseDays: 85, baseCost: 22000 },
  telecommunications: { riskBase: "High", costMultiplier: 1.1, timeMultiplier: 1.0, baseDays: 75, baseCost: 20000 },
  insurance: { riskBase: "High", costMultiplier: 1.3, timeMultiplier: 1.2, baseDays: 95, baseCost: 28000 },
  pharmaceuticals: { riskBase: "High", costMultiplier: 1.6, timeMultiplier: 1.4, baseDays: 150, baseCost: 50000 },
  "travel-tourism": { riskBase: "Low", costMultiplier: 0.7, timeMultiplier: 0.7, baseDays: 35, baseCost: 9000 },
  general: { riskBase: "Medium", costMultiplier: 0.8, timeMultiplier: 0.8, baseDays: 50, baseCost: 12000 },
};

const INDUSTRY_RISK_SCENARIOS = {
  fintech: [
    {
      title: "Anti-Money Laundering Compliance Failure",
      category: "Legal",
      baseImpact: 5,
      affectedRequirement: "AML program implementation and SAR filing requirements",
      businessConsequence: "Loss of banking partnerships, inability to process transactions, and potential criminal liability for officers. Revenue impact from frozen accounts and restricted operations.",
      regulatoryConsequence: "Civil monetary penalties up to $1M per violation per day, criminal prosecution of responsible individuals, and potential license revocation by FinCEN or equivalent authority.",
      mitigation: "Implement automated transaction monitoring system, establish SAR filing procedures, conduct regular independent audits, and maintain comprehensive AML training program.",
    },
    {
      title: "Customer Data Privacy Breach",
      category: "Legal",
      baseImpact: 4,
      affectedRequirement: "Data protection and privacy compliance requirements",
      businessConsequence: "Class action lawsuits, customer churn, loss of business partner confidence, and significant remediation costs. Brand damage may persist for years.",
      regulatoryConsequence: "GDPR fines up to 4% of global turnover, CCPA statutory damages of $100-$750 per consumer per incident, mandatory breach notification within 72 hours.",
      mitigation: "Deploy end-to-end encryption, implement data access controls, establish incident response plan, conduct regular penetration testing, and appoint a Data Protection Officer.",
    },
    {
      title: "Payment System Security Compromise",
      category: "Technical",
      baseImpact: 5,
      affectedRequirement: "Payment security and PCI DSS compliance requirements",
      businessConsequence: "Immediate suspension of payment processing capabilities, loss of merchant accounts, customer refunds liability, and potential insolvency from fraud losses.",
      regulatoryConsequence: "PCI DSS non-compliance fines of $5,000-$100,000 per month, card brand penalties, potential termination of card processing privileges.",
      mitigation: "Achieve and maintain PCI DSS certification, implement tokenization, deploy real-time fraud detection, establish secure key management procedures.",
    },
    {
      title: "Regulatory License Non-Renewal",
      category: "Legal",
      baseImpact: 5,
      affectedRequirement: "Payment institution or e-money licensing requirements",
      businessConsequence: "Complete cessation of regulated financial services, loss of revenue, customer migration to competitors, and potential wind-down costs.",
      regulatoryConsequence: "License suspension or revocation, mandatory customer notification, forced asset transfer or return of funds within prescribed timelines.",
      mitigation: "Maintain proactive regulator relationships, submit timely license renewal applications, ensure ongoing compliance with license conditions, and document compliance evidence.",
    },
    {
      title: "Cross-Border Data Transfer Violation",
      category: "Operational",
      baseImpact: 3,
      affectedRequirement: "Data localization and cross-border transfer requirements",
      businessConsequence: "Operational disruption from forced data localization, increased infrastructure costs, market access restrictions, and potential service suspension.",
      regulatoryConsequence: "Data transfer suspension orders, administrative fines, mandatory data localization within prescribed timeframes, enhanced regulatory scrutiny.",
      mitigation: "Implement data residency controls, establish Standard Contractual Clauses where applicable, deploy geo-fencing for data processing, maintain transfer impact assessments.",
    },
    {
      title: "Third-Party Vendor Compliance Failure",
      category: "Operational",
      baseImpact: 3,
      affectedRequirement: "Third-party risk management and oversight requirements",
      businessConsequence: "Service disruption from vendor non-compliance, regulatory liability transfer, reputational damage from vendor incidents, and costly vendor transitions.",
      regulatoryConsequence: "Regulatory censure for inadequate oversight, fines for vendor-caused violations, mandatory vendor audit requirements, enhanced supervisory attention.",
      mitigation: "Implement vendor risk assessment framework, establish contractual compliance requirements, conduct regular vendor audits, maintain vendor risk register with tiered classification.",
    },
    {
      title: "Market Access Restriction Imposition",
      category: "Market",
      baseImpact: 4,
      affectedRequirement: "Market entry and operational licensing requirements",
      businessConsequence: "Delayed market entry resulting in lost revenue opportunity, competitor advantage, investor confidence impact, and potential write-off of market entry investments.",
      regulatoryConsequence: "Temporary or permanent market access restrictions, enhanced entry requirements, mandatory local partnership or subsidiary establishment.",
      mitigation: "Engage early with regulatory authorities, participate in regulatory sandboxes where available, establish local legal presence, build relationships with industry associations.",
    },
    {
      title: "Financial Reporting Non-Compliance",
      category: "Financial",
      baseImpact: 3,
      affectedRequirement: "Financial reporting and audit requirements",
      businessConsequence: "Investor confidence erosion, potential delisting for public companies, increased cost of capital, and reputational damage with financial stakeholders.",
      regulatoryConsequence: "SEC enforcement actions, restatement requirements, officer and director bars, civil penalties and disgorgement of profits.",
      mitigation: "Implement robust internal controls, establish SOX compliance program, engage qualified external auditors, maintain comprehensive documentation of financial processes.",
    },
  ],
  healthcare: [
    {
      title: "Patient Data HIPAA Violation",
      category: "Legal",
      baseImpact: 5,
      affectedRequirement: "HIPAA Privacy and Security Rule compliance",
      businessConsequence: "OCR investigation and corrective action plan, loss of healthcare partner trust, patient litigation, and potential exclusion from federal healthcare programs.",
      regulatoryConsequence: "HIPAA penalties ranging from $100 to $50,000 per violation (up to $1.5M per year), mandatory corrective action plans, and potential criminal referral.",
      mitigation: "Implement comprehensive HIPAA compliance program, conduct annual risk assessments, establish Business Associate Agreements, deploy ePHI encryption and access controls.",
    },
    {
      title: "Medical Device Classification Error",
      category: "Technical",
      baseImpact: 5,
      affectedRequirement: "Medical device regulatory classification and CE marking",
      businessConsequence: "Product recall, market withdrawal, customer safety liability, loss of certifications, and significant re-engineering costs to meet correct classification.",
      regulatoryConsequence: "Mandatory product recall, CE/UKCA mark withdrawal, regulatory investigation, potential criminal liability for unlicensed medical device distribution.",
      mitigation: "Engage notified body early for classification guidance, implement design controls per ISO 13485, establish post-market surveillance, maintain comprehensive technical documentation.",
    },
    {
      title: "Clinical Data Integrity Failure",
      category: "Operational",
      baseImpact: 4,
      affectedRequirement: "Clinical evidence and data integrity requirements",
      businessConsequence: "Clinical evidence invalidation, regulatory submission delays, potential product license revocation, and loss of clinical partner relationships.",
      regulatoryConsequence: "FDA warning letters, clinical hold orders, mandatory repeat of clinical studies, disqualification of principal investigators.",
      mitigation: "Implement ALCOA+ data integrity principles, deploy validated electronic data capture systems, establish audit trail requirements, conduct regular data integrity reviews.",
    },
    {
      title: "Health Data Localization Breach",
      category: "Technical",
      baseImpact: 4,
      affectedRequirement: "Health data storage and localization requirements",
      businessConsequence: "Forced infrastructure migration, service interruption during remediation, increased operational costs, and potential loss of health authority trust.",
      regulatoryConsequence: "Data processing suspension orders, fines under data protection regulations, mandatory breach notifications, enhanced regulatory oversight.",
      mitigation: "Deploy region-specific data centers, implement data residency controls, establish data flow mapping, conduct regular localization compliance audits.",
    },
    {
      title: "Post-Market Surveillance Gap",
      category: "Operational",
      baseImpact: 4,
      affectedRequirement: "Post-market surveillance and vigilance reporting",
      businessConsequence: "Undetected product safety issues, delayed field safety corrective actions, increased liability exposure, and reputational damage in the healthcare sector.",
      regulatoryConsequence: "Regulatory authority enforcement actions, mandatory field safety notices, product suspension orders, and enhanced post-market requirements.",
      mitigation: "Establish systematic post-market surveillance program, implement adverse event reporting systems, deploy real-world evidence collection, maintain vigilance reporting procedures.",
    },
    {
      title: "Quality Management System Deficiency",
      category: "Operational",
      baseImpact: 3,
      affectedRequirement: "Quality management system compliance (ISO 13485 / 21 CFR Part 11)",
      businessConsequence: "Manufacturing delays, audit findings requiring costly remediation, loss of quality certifications, and potential supply chain disruption.",
      regulatoryConsequence: "FDA Form 483 observations, warning letters, import alerts, suspension of marketing authorization, mandatory CAPA implementation.",
      mitigation: "Implement ISO 13485-compliant QMS, establish internal audit program, deploy corrective and preventive action system, maintain design history files.",
    },
  ],
  edtech: [
    {
      title: "Student Data Privacy Violation",
      category: "Legal",
      baseImpact: 4,
      affectedRequirement: "Student privacy and FERPA/COPPA compliance",
      businessConsequence: "Loss of school district contracts, parent lawsuits, negative media coverage, and potential ban from educational institutions.",
      regulatoryConsequence: "FTC enforcement actions under COPPA, FERPA violation findings by DOE, state attorney general investigations, and loss of federal education funding eligibility.",
      mitigation: "Implement student data minimization practices, establish verifiable parental consent mechanisms, deploy age-appropriate design codes, maintain comprehensive privacy policies.",
    },
    {
      title: "Children's Data Processing Violation",
      category: "Legal",
      baseImpact: 5,
      affectedRequirement: "COPPA and children's data protection requirements",
      businessConsequence: "Immediate service suspension for minors, costly consent mechanism implementation, potential class action from parents, and advertising revenue loss.",
      regulatoryConsequence: "COPPA fines up to $50,120 per violation, mandatory COPPA Safe Harbor participation, FTC consent orders with 20-year monitoring.",
      mitigation: "Implement robust age verification, establish COPPA-compliant consent flows, deploy data retention limits for minors, conduct regular COPPA compliance audits.",
    },
    {
      title: "Platform Accessibility Non-Compliance",
      category: "Technical",
      baseImpact: 3,
      affectedRequirement: "ADA and WCAG accessibility requirements",
      businessConsequence: "Lawsuits from disability advocacy groups, loss of government education contracts, exclusion from market segments, and reputational damage.",
      regulatoryConsequence: "DOJ ADA enforcement actions, private right of action lawsuits, settlement requirements with ongoing monitoring, and potential loss of federal funding.",
      mitigation: "Achieve WCAG 2.1 AA compliance, implement automated accessibility testing, conduct regular user testing with assistive technologies, maintain accessibility documentation.",
    },
    {
      title: "Cross-Border Student Data Transfer",
      category: "Operational",
      baseImpact: 3,
      affectedRequirement: "International data transfer and student data protection",
      businessConsequence: "Service suspension in target markets, costly data localization implementation, loss of international school partnerships, and market exit risk.",
      regulatoryConsequence: "Data protection authority enforcement actions, transfer suspension orders, mandatory Standard Contractual Clauses, and enhanced regulatory scrutiny.",
      mitigation: "Implement data residency controls for student data, establish transfer impact assessments, deploy encryption for cross-border transfers, maintain data processing agreements.",
    },
    {
      title: "Educational Content Regulatory Violation",
      category: "Reputational",
      baseImpact: 3,
      affectedRequirement: "Content standards and curriculum compliance requirements",
      businessConsequence: "Content removal orders, loss of institutional partnerships, negative media coverage, and potential curriculum decertification.",
      regulatoryConsequence: "Education authority sanctions, content removal mandates, curriculum review requirements, and potential operating restrictions.",
      mitigation: "Establish content review governance board, implement curriculum alignment verification, deploy content moderation systems, maintain regulatory compliance documentation for content.",
    },
    {
      title: "AI-Powered Learning Algorithm Bias",
      category: "Reputational",
      baseImpact: 3,
      affectedRequirement: "AI fairness and algorithmic accountability requirements",
      businessConsequence: "Student outcome disparities, institutional reputation damage, loss of educator trust, and potential discrimination lawsuits.",
      regulatoryConsequence: "Algorithmic accountability investigations, mandatory bias audits, AI system registration requirements, and enhanced oversight of automated decision-making.",
      mitigation: "Implement AI ethics review process, deploy algorithmic bias testing, establish student outcome monitoring, maintain AI transparency documentation.",
    },
  ],
  general: [
    {
      title: "Data Protection Non-Compliance",
      category: "Legal",
      baseImpact: 4,
      affectedRequirement: "General data protection and privacy requirements",
      businessConsequence: "Regulatory fines, customer trust erosion, operational disruption from data processing restrictions, and costly remediation programs.",
      regulatoryConsequence: "Administrative fines, mandatory data processing suspension, breach notification requirements, and enhanced regulatory supervision.",
      mitigation: "Implement comprehensive data protection program, appoint a Data Protection Officer, conduct Data Protection Impact Assessments, establish data subject request procedures.",
    },
    {
      title: "Cybersecurity Incident Response Failure",
      category: "Technical",
      baseImpact: 4,
      affectedRequirement: "Cybersecurity and incident response requirements",
      businessConsequence: "Extended operational downtime, data loss, customer compensation liability, and significant recovery costs.",
      regulatoryConsequence: "Mandatory incident reporting, regulatory investigation, potential enforcement actions for inadequate security measures.",
      mitigation: "Develop and test incident response plan, deploy security monitoring and detection tools, establish backup and recovery procedures, conduct regular tabletop exercises.",
    },
    {
      title: "Regulatory Reporting Non-Compliance",
      category: "Operational",
      baseImpact: 3,
      affectedRequirement: "Regulatory reporting and notification requirements",
      businessConsequence: "Late reporting penalties, increased regulatory scrutiny, potential license conditions, and management distraction.",
      regulatoryConsequence: "Administrative penalties for late or inaccurate reporting, enhanced reporting requirements, mandatory third-party audits.",
      mitigation: "Implement automated reporting systems, establish reporting calendar with reminders, create report review and approval workflows, maintain audit trails.",
    },
    {
      title: "Cross-Border Operations Compliance Gap",
      category: "Market",
      baseImpact: 3,
      affectedRequirement: "International regulatory compliance requirements",
      businessConsequence: "Market access delays, competitive disadvantage, potential market exit costs, and investor confidence impact.",
      regulatoryConsequence: "Market access restrictions, enhanced entry requirements, mandatory local establishment, and ongoing regulatory reporting obligations.",
      mitigation: "Engage local legal counsel in each target market, establish regulatory compliance roadmap, implement market-specific compliance controls, build local advisory relationships.",
    },
  ],
};

const MARKET_NAMES = {
  de: "Germany", fr: "France", us: "United States", uk: "United Kingdom",
  jp: "Japan", cn: "China", in: "India", br: "Brazil", au: "Australia",
  ca: "Canada", kr: "South Korea", sg: "Singapore", ae: "UAE",
  sa: "Saudi Arabia", mx: "Mexico", it: "Italy", es: "Spain",
  nl: "Netherlands", se: "Sweden", ch: "Switzerland", eu: "European Union",
};

const MARKET_FLAGS = {
  de: "🇩🇪", fr: "🇫🇷", us: "🇺🇸", uk: "🇬🇧", jp: "🇯🇵", cn: "🇨🇳",
  in: "🇮🇳", br: "🇧🇷", au: "🇦🇺", ca: "🇨🇦", kr: "🇰🇷", sg: "🇸🇬",
  ae: "🇦🇪", sa: "🇸🇦", mx: "🇲🇽", it: "🇮🇹", es: "🇪🇸", nl: "🇳🇱",
  se: "🇸🇪", ch: "🇨🇭", eu: "🇪🇺",
};

const INDUSTRY_TRENDS = {
  fintech: [
    "Open banking and API-driven financial services expanding globally",
    "Central Bank Digital Currency (CBDC) development accelerating across major economies",
    "AI and machine learning adoption in fraud detection and credit scoring",
    "Increasing regulatory focus on crypto-asset and DeFi governance",
    "Embedded finance and Banking-as-a-Service models gaining regulatory attention",
  ],
  healthcare: [
    "Telemedicine and remote patient monitoring regulations evolving rapidly",
    "AI/ML in clinical decision support facing new regulatory frameworks",
    "Health data interoperability mandates increasing across jurisdictions",
    "Post-market surveillance requirements becoming more stringent",
    "Digital health applications (DiGA) gaining regulatory recognition",
  ],
  edtech: [
    "Student data privacy regulations tightening globally",
    "AI-powered adaptive learning facing new content and fairness regulations",
    "Accessibility requirements for educational platforms becoming mandatory",
    "Cross-border education data transfer under increased scrutiny",
    "Micro-credential and digital certification frameworks emerging",
  ],
  ecommerce: [
    "Consumer protection regulations expanding to cover digital marketplaces",
    "Product safety and liability frameworks updating for e-commerce",
    "Cross-border e-commerce tax compliance requirements increasing",
    "Digital marketplace operator accountability regulations emerging",
    "Supply chain transparency and sustainability reporting mandates growing",
  ],
  saas: [
    "Data residency and sovereignty requirements affecting cloud service providers",
    "Software liability and warranty regulations evolving for SaaS models",
    "AI governance frameworks impacting SaaS features and deployment",
    "Vendor lock-in protection regulations gaining traction",
    "SOC 2 and ISO 27001 becoming baseline expectations across markets",
  ],
  "ai-ml": [
    "EU AI Act establishing global precedent for AI regulation",
    "Algorithmic accountability and transparency requirements expanding",
    "AI bias auditing becoming mandatory in regulated industries",
    "Foundation model regulations emerging across major economies",
    "AI safety and alignment requirements increasing in complexity",
  ],
  manufacturing: [
    "Environmental compliance and emissions reporting requirements tightening",
    "Product safety and traceability regulations expanding",
    "Industrial data protection and OT security mandates growing",
    "Supply chain due diligence and conflict minerals regulations increasing",
    "Circular economy and waste reduction compliance requirements emerging",
  ],
  retail: [
    "Consumer data rights and opt-out requirements expanding",
    "Product labeling and advertising standards tightening",
    "Sustainability and environmental impact disclosure mandates growing",
    "E-commerce return and refund regulations standardizing",
    "Loyalty program and pricing transparency regulations emerging",
  ],
  "food-beverage": [
    "Food safety standards harmonization across international markets",
    "Nutritional labeling and health claim regulations tightening",
    "Allergen disclosure and traceability requirements expanding",
    "Sustainable packaging regulations becoming mandatory",
    "Organic and clean-label certification standards evolving",
  ],
  logistics: [
    "Customs and trade compliance automation requirements increasing",
    "Supply chain security and CTPAT-like standards expanding",
    "Environmental emissions reporting for transport becoming mandatory",
    "Drone and autonomous delivery regulations emerging",
    "Dangerous goods handling compliance requirements tightening",
  ],
  energy: [
    "Renewable energy certification and greenwashing prevention regulations expanding",
    "Carbon emissions reporting and ESG disclosure requirements tightening",
    "Grid interconnection and distributed energy resource regulations evolving",
    "Energy storage and battery safety standards becoming mandatory",
    "Critical infrastructure cybersecurity requirements increasing",
  ],
  automotive: [
    "Vehicle safety and autonomous driving regulations evolving rapidly",
    "Electric vehicle charging standards and interoperability mandates growing",
    "Connected car data privacy and cybersecurity regulations expanding",
    "Emissions and fuel economy standards tightening globally",
    "Right-to-repair legislation gaining traction across markets",
  ],
  telecommunications: [
    "5G network security and vendor risk management requirements expanding",
    "Net neutrality regulations being reintroduced in various jurisdictions",
    "Spectrum allocation and sharing compliance requirements evolving",
    "Critical communications infrastructure protection mandates increasing",
    "SIM registration and digital identity requirements tightening",
  ],
  insurance: [
    "Insurance product suitability and consumer protection rules expanding",
    "Insurtech regulatory sandboxes and innovation frameworks growing",
    "Climate risk disclosure and catastrophe modeling requirements increasing",
    "Cross-border insurance passporting regulations evolving",
    "AI-driven underwriting fairness and transparency requirements tightening",
  ],
  pharmaceuticals: [
    "Drug pricing transparency regulations expanding globally",
    "Clinical trial registration and data sharing mandates increasing",
    "Pharmacovigilance and adverse event reporting requirements tightening",
    "Biosimilar and generic drug approval pathways evolving",
    "Controlled substance tracking and diversion prevention regulations strengthening",
  ],
  "travel-tourism": [
    "Travel data protection and PNR regulations tightening",
    "Tour operator licensing and consumer protection requirements expanding",
    "Visa and immigration compliance automation requirements growing",
    "Sustainable tourism certification standards emerging",
    "Health and safety protocols for travel services becoming permanent",
  ],
  general: [
    "Data protection regulations expanding across all sectors",
    "AI governance frameworks being established in major markets",
    "Cross-border data transfer requirements tightening",
    "Cybersecurity regulations increasing in scope and enforcement",
    "Environmental and sustainability reporting requirements emerging",
  ],
};

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function buildRequirementTexts(industry, target, company, product) {
  const r = seededRandom(hashCode(industry + target + company + product));
  const priorities = ["critical", "important", "standard"];
  return { rand: r, priorities };
}

export function runDemoAnalysis({ company, product, origin, target, industry, analysisId = null }) {
  const targetName = MARKET_NAMES[target] || target;
  const targetFlag = MARKET_FLAGS[target] || "🌐";
  const industryKey = (industry || "general").toLowerCase().replace(/[^a-z]/g, "");
  const defaults = INDUSTRY_DEFAULTS[industryKey] || INDUSTRY_DEFAULTS.general;

  const regulations = (REG_DB[industryKey]?.[target] || REG_DB[industryKey]?.["us"] || []).map((reg) => ({
    ...reg,
    date: reg.date || "2024-01-15",
    flag: targetFlag,
    watch: true,
    update: false,
    updateDesc: "",
    sim: reg.impact === "high" ? {
      reqs: "+" + (1 + Math.floor(hashCode(reg.id + "sim") % 5)),
      cost: "+" + Math.round(defaults.baseCost * 0.1),
      days: "+" + (10 + Math.floor(hashCode(reg.id + "days") % 30)),
      note: `Simulating policy change for ${reg.title} in ${targetName}`,
    } : null,
    costImpact: Math.round(defaults.baseCost * 0.15 * (0.5 + Math.random() * 1.0)),
  }));

  if (regulations.length === 0) {
    regulations.push({
      id: `${target}-general-data`, title: "General Data Protection Requirements",
      authority: `${targetName} Data Protection Authority`, kind: "Existing", code: "General DPA",
      summary: `General data protection and privacy requirements applicable in ${targetName}.`,
      source: `${targetName} Regulatory Authority`, confidence: "medium",
      impact: "medium", impactTitle: "Data Protection", impactDesc: `General compliance framework for ${targetName}.`,
      flag: targetFlag, date: "2024-01-15", watch: true, update: false, updateDesc: "", sim: null, costImpact: Math.round(defaults.baseCost * 0.1),
    });
  }

  const priorityPool = [
    { key: "critical", label: "Critical" },
    { key: "important", label: "Important" },
    { key: "standard", label: "Standard" },
  ];

  const requirements = [];
  let reqIdx = 1;
  for (const reg of regulations) {
    const numReqs = 1 + Math.floor(hashCode(reg.id + "count") % 3);
    for (let i = 0; i < numReqs; i++) {
      const pIdx = (reqIdx - 1) % 3;
      const priority = priorityPool[pIdx].key;
      const dueDays = priority === "critical" ? 30 + (reqIdx * 5) : priority === "important" ? 60 + (reqIdx * 8) : 90 + (reqIdx * 10);
      requirements.push({
        id: `req-${reqIdx}`,
        name: `${reg.title} - Requirement ${i + 1}`,
        authority: reg.authority,
        priority,
        status: "pending",
        due: `Q${Math.min(4, Math.ceil(dueDays / 90))} 2026`,
        dueDays,
        desc: `Compliance requirement derived from ${reg.title}. ${reg.summary} For ${company}'s ${product} in ${targetName}.`,
        actionTitle: `Implement ${reg.title} compliance`,
        gapTitle: `${reg.title} gap for ${product}`,
        gapDesc: `${company} has not yet implemented ${reg.title} compliance measures for ${product} in ${targetName}.`,
      });
      reqIdx++;
    }
  }

  const gaps = requirements.map((r) => ({
    reqId: r.id,
    title: r.gapTitle,
    description: r.gapDesc,
    priority: r.priority,
    severity: r.priority === "critical" ? "high" : r.priority === "important" ? "medium" : "low",
  }));

  const rawActions = requirements.map((r, i) => ({
    reqId: r.id,
    title: r.actionTitle,
    description: `Implement the necessary compliance measures for ${r.name} to meet ${r.authority} requirements.`,
    priority: r.priority,
    dueDays: r.dueDays,
    owner: i % 3 === 0 ? "Legal" : i % 3 === 1 ? "Engineering" : "Compliance",
    estimatedCost: Math.round(defaults.baseCost / requirements.length * (0.5 + Math.random())),
    estimatedDays: Math.round(r.dueDays * 0.6),
  }));

  const total = requirements.length;
  const critical = requirements.filter((r) => r.priority === "critical").length;
  const important = requirements.filter((r) => r.priority === "important").length;
  const standard = total - critical - important;

  const estimatedCost = Math.round(defaults.baseCost * defaults.costMultiplier);
  const estimatedDays = Math.round(defaults.baseDays * defaults.timeMultiplier);
  const readiness = 0;

  const analysisData = {
    company,
    product,
    origin: origin || "India",
    target: targetName,
    targetId: target,
    industry,
    readiness,
    riskLevel: defaults.riskBase,
    estimatedDays,
    estimatedCost,
    confidenceNote: "Demo regulatory intelligence - based on predefined knowledge dataset",
    regulations,
    requirements,
    gaps,
    actions: [], // filled by shared core below
    costItems: rawActions.map((a) => ({
      name: a.title,
      amount: a.estimatedCost,
      days: a.estimatedDays,
      reqId: a.reqId,
      category: a.owner,
    })),
    stats: {
      total, critical, important, standard,
      completed: 0, inProgress: 0, pending: total, nA: 0,
    },
    gapStats: {
      open: gaps.length, closed: 0, inProgress: 0,
    },
    completedStages: ["research", "requirements", "gaps", "actions", "readiness"],
    mode: "demo",
    regulatoryUpdates: regulations.slice(0, 3).map((r) => ({
      title: `Update: ${r.title}`,
      date: "2025-01-15",
      jurisdiction: targetName,
      industry,
      impact: r.impact || "medium",
      source: r.source,
      type: "Amendment",
    })),
    impactAnalysis: {
      legal: {
        score: critical > 2 ? 80 : 50,
        level: critical > 2 ? "High" : "Medium",
        description: `${critical} critical and ${important} important legal requirements have been identified for ${company}'s ${product} in ${targetName}. Non-compliance with ${regulations.filter(r => r.impact === "high").length} high-impact regulations could result in enforcement actions, fines, and operational restrictions. Immediate legal review is recommended to establish a compliance roadmap and prioritize remediation efforts.`,
      },
      operational: {
        score: Math.min(90, total * 5),
        level: Math.min(90, total * 5) >= 70 ? "High" : "Medium",
        description: `${total} compliance requirements will impact ${company}'s operational workflows across legal, engineering, and compliance teams. The operational burden includes process changes, documentation updates, reporting mechanisms, and staff training. Estimated implementation timeline of ${estimatedDays} days suggests significant resource allocation is needed.`,
      },
      financial: {
        score: Math.min(85, Math.round(estimatedCost / 500)),
        level: Math.min(85, Math.round(estimatedCost / 500)) >= 70 ? "High" : Math.min(85, Math.round(estimatedCost / 500)) >= 40 ? "Medium" : "Low",
        description: `Total estimated compliance cost of $${estimatedCost.toLocaleString()} represents a ${estimatedCost > 30000 ? "significant" : estimatedCost > 15000 ? "moderate" : "manageable"} investment for ${company}. These costs include documentation, technology implementation, consulting, and ongoing monitoring. Non-compliance penalties in ${targetName} could exceed the compliance investment by ${defaults.riskBase === "High" ? "5-10x" : "2-5x"}.`,
      },
      technical: {
        score: 40,
        level: "Medium",
        description: `Technical compliance requirements include system integration, data handling modifications, security controls, and audit trail implementation. ${regulations.length} regulations mandate specific technical standards that ${company}'s ${product} must meet. Key technical areas include data encryption, access controls, logging, and secure data storage.`,
      },
      market: {
        score: 30,
        level: "Low",
        description: `Market access in ${targetName} is contingent on achieving compliance with local regulatory requirements. ${regulations.length} regulations govern market entry and ongoing operations. Delays in compliance could result in lost market opportunities, while proactive compliance can serve as a competitive advantage in the ${industry} sector.`,
      },
      reputation: {
        score: critical > 3 ? 70 : 40,
        level: critical > 3 ? "High" : "Medium",
        description: `${company}'s brand reputation in ${targetName} is directly tied to regulatory compliance. ${critical > 3 ? "Multiple critical compliance gaps pose significant reputational risk." : critical > 0 ? "Critical compliance gaps could attract negative media attention." : "Compliance posture appears manageable with timely remediation."} Customer trust, partner relationships, and market positioning depend on demonstrating strong regulatory adherence in the ${industry} sector.`,
      },
    },
    policySimulation: null,
    industryImpact: {
      industry: industry,
      industryName: industry,
      targetMarket: targetName,
      totalRegulations: regulations.length,
      regulatoryBurden: defaults.riskBase === "High" ? "Very High" : regulations.length > 5 ? "High" : regulations.length > 3 ? "Medium" : "Low",
      complianceBurden: defaults.riskBase === "High" ? "Heavy" : defaults.riskBase === "Medium" ? "Moderate" : "Light",
      riskLevel: defaults.riskBase,
      requirementDensity: Math.round(requirements.length / Math.max(1, regulations.length) * 10) / 10,
      complianceComplexity: requirements.length > 15 ? "High" : requirements.length > 8 ? "Medium" : "Low",
      marketReadiness: Math.max(10, Math.min(90, Math.round(100 - regulations.length * 8 - (defaults.riskBase === "High" ? 20 : defaults.riskBase === "Medium" ? 10 : 0)))),
      growthImpact: `The regulatory environment in ${targetName} presents ${defaults.riskBase === "High" ? "significant challenges" : defaults.riskBase === "Medium" ? "moderate considerations" : "manageable requirements"} for ${company}'s growth in the ${industry} sector. ${requirements.length > 15 ? "High compliance complexity may slow market entry but ensures long-term sustainability." : "Compliance requirements are achievable within standard operational timelines."}`,
      topRegulations: regulations.filter(r => r.impact === "high").slice(0, 3).map(r => r.title),
      keyTrends: [
        `Increasing regulatory scrutiny in ${industry} sector`,
        `Cross-border data transfer requirements tightening in ${targetName}`,
        `New compliance deadlines approaching in 2025-2026`,
      ],
      industryTrends: (INDUSTRY_TRENDS[industryKey] || INDUSTRY_TRENDS.general),
    },
    scenarios: [],
    summary: {},
  };

  // === RISK MATRIX ===
  const riskScenarios = INDUSTRY_RISK_SCENARIOS[industryKey] || INDUSTRY_RISK_SCENARIOS.general || [];
  const numRisks = Math.min(8, Math.max(4, Math.ceil(regulations.length * 0.75)));
  const industryRisks = riskScenarios;
  const generalRisks = (INDUSTRY_RISK_SCENARIOS.general || []).filter(
    gr => !industryRisks.some(ir => ir.title === gr.title)
  );
  const allRiskPool = [...industryRisks, ...generalRisks];
  const selectedRisks = allRiskPool.slice(0, numRisks);

  const riskMatrix = selectedRisks.map((scenario, i) => {
    const rr = seededRandom(hashCode(scenario.title + industryKey + target + company));
    const baseProb = defaults.riskBase === "High" ? 3.5 : defaults.riskBase === "Medium" ? 2.5 : 1.5;
    const probability = Math.min(5, Math.max(1, Math.round(baseProb + (rr() - 0.5) * 2)));
    const impactVal = Math.min(5, Math.max(1, Math.round(scenario.baseImpact + (rr() - 0.5) * 1)));
    const score = probability * impactVal;
    const severity = score >= 16 ? "Critical" : score >= 10 ? "High" : score >= 5 ? "Medium" : "Low";
    return {
      id: `RISK-${String(i + 1).padStart(3, "0")}`,
      title: scenario.title,
      category: scenario.category,
      probability,
      impact: impactVal,
      severity,
      affectedRequirement: scenario.affectedRequirement,
      businessConsequence: scenario.businessConsequence,
      regulatoryConsequence: scenario.regulatoryConsequence,
      mitigation: scenario.mitigation,
      status: "Open",
    };
  });

  // === COST BREAKDOWN ===
  const costRatios = [0.15, 0.25, 0.20, 0.20, 0.10, 0.10];
  const costCategoryNames = ["Documentation", "Technology", "Implementation", "Consulting", "Testing", "Remediation"];
  let costRunningTotal = 0;
  const costBreakdown = costCategoryNames.map((cat, i) => {
    if (i < costCategoryNames.length - 1) {
      const amount = Math.round(estimatedCost * costRatios[i]);
      costRunningTotal += amount;
      return { category: cat, amount, percentage: Math.round(costRatios[i] * 100) };
    }
    const lastAmount = estimatedCost - costRunningTotal;
    const lastPct = 100 - costRatios.slice(0, -1).reduce((s, r) => s + Math.round(r * 100), 0);
    return { category: cat, amount: lastAmount, percentage: lastPct };
  });

  // === ENHANCED STATS ===
  const riskDist = { critical: 0, high: 0, medium: 0, low: 0 };
  riskMatrix.forEach(r => { riskDist[r.severity.toLowerCase()]++; });

  const complianceByCategory = {};
  const categoryKeywords = {
    "Data Privacy": ["privacy", "data protection", "gdpr", "ccpa", "dpdp", "dpb", "ukgdpr"],
    "Security": ["security", "cyber", "nis", "hipaa sec", "hds"],
    "Financial": ["aml", "bsa", "kyc", "psd", "fca", "mifid", "payment", "gramm", "reg e", "ecfa", "sox", "e-money", "pca"],
    "Medical": ["medical", "device", "fda", "mdr", "ivdr", "health", "hipaa", "hitech", "21 cfr", "amg", "mhra", "abdm"],
    "Education": ["ferpa", "coppa", "education", "nep", "student"],
  };
  requirements.forEach(req => {
    const nameLower = req.name.toLowerCase();
    let matched = false;
    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(kw => nameLower.includes(kw))) {
        complianceByCategory[cat] = (complianceByCategory[cat] || 0) + 1;
        matched = true;
        break;
      }
    }
    if (!matched) {
      complianceByCategory["General"] = (complianceByCategory["General"] || 0) + 1;
    }
  });

  analysisData.stats = {
    ...analysisData.stats,
    regulatoryUpdates: regulations.filter(r => r.kind === "New").length,
    riskDistribution: riskDist,
    complianceByCategory,
  };

  analysisData.riskMatrix = riskMatrix;
  analysisData.costBreakdown = costBreakdown;

  // === SHARED CORE — one source of truth with live pipeline ===
  const actions = core.enrichActionPlan(rawActions, { requirements, gaps, risks: riskMatrix }).actions;
  analysisData.actions = actions;
  analysisData.timeline = core.computeTimeline(actions);
  analysisData.sources = core.collectSources(regulations, { targetCountry: targetName });
  analysisData.readinessBreakdown = core.calculateReadiness({ requirements, gaps, risks: riskMatrix });
  analysisData.readiness = analysisData.readinessBreakdown.score;
  analysisData.readinessStatus = analysisData.readinessBreakdown.status;
  analysisData.gapStats = {
    open: analysisData.readinessBreakdown.breakdown.counts.gapsOpen,
    closed: analysisData.readinessBreakdown.breakdown.counts.gapsClosed,
    inProgress: 0,
  };
  analysisData.canLaunch = core.canLaunch({
    readinessBreakdown: analysisData.readinessBreakdown,
    requirements,
    gaps,
    risks: riskMatrix,
  });
  if (analysisId) analysisData.analysisId = analysisId;
  analysisData.input = { company, product, origin: origin || "India", target: targetName, industry };
  analysisData.research = {
    regulationsCount: regulations.length,
    riskLevel: defaults.riskBase,
    confidenceNote: "Demo regulatory intelligence - based on predefined knowledge dataset",
    estimatedDays,
    estimatedCost,
  };
  analysisData.cost = {
    currency: "USD",
    items: analysisData.costItems,
    total: analysisData.costItems.reduce((s, c) => s + (Number(c.amount) || 0), 0),
  };
  analysisData.metadata = { engine: "regulens-core@1", mode: "demo", generatedAt: new Date().toISOString() };
  analysisData.completedStages = ["research", "requirements", "gaps", "risks", "actions", "readiness"];

  // === AGENT OUTPUTS ===
  const criticalRisks = riskMatrix.filter(r => r.severity === "Critical").length;
  const highRisks = riskMatrix.filter(r => r.severity === "High").length;
  const mediumRisks = riskMatrix.filter(r => r.severity === "Medium").length;
  const lowRisks = riskMatrix.filter(r => r.severity === "Low").length;
  const agentRiskLevel = criticalRisks > 0 ? "Critical" : highRisks > 2 ? "High" : highRisks > 0 ? "Medium" : "Low";
  const immediateActions = actions.filter(a => a.dueDays <= 30);
  const shortTermActions = actions.filter(a => a.dueDays > 30 && a.dueDays <= 90);
  const mediumTermActions = actions.filter(a => a.dueDays > 90 && a.dueDays <= 180);
  const longTermActions = actions.filter(a => a.dueDays > 180);

  analysisData.agentOutputs = {
    regulatoryResearch: {
      objective: `Identify all regulations applicable to ${company}'s ${product} operating in ${targetName} market`,
      inputContext: `Industry: ${industry}, Source: ${origin || "India"}, Target: ${targetName}`,
      findings: regulations.map(reg => ({
        regulation: reg.title,
        jurisdiction: targetName,
        applicability: reg.impact === "high" ? "Directly Applicable" : "Potentially Applicable",
        effectiveDate: reg.date || "2024-01-15",
        status: reg.kind,
        source: reg.source,
      })),
      keyFindings: `Identified ${regulations.length} applicable regulations governing ${industry} operations in ${targetName}. ${critical} critical requirements demand immediate attention, while ${important} important requirements should be addressed within the next quarter. The regulatory landscape for ${product} services is ${defaults.riskBase === "High" ? "complex, with active enforcement and evolving requirements" : defaults.riskBase === "Medium" ? "moderately complex with established frameworks" : "relatively straightforward with clear guidelines"}.`,
      regulatoryChanges: `Recent developments include ${regulations.filter(r => r.kind === "New").length} newly enacted regulations and amendments to existing frameworks. ${targetName} authorities are ${defaults.riskBase === "High" ? "increasing enforcement actions and tightening compliance standards" : "maintaining steady regulatory oversight with periodic updates"}. Cross-border data transfer and ${industry}-specific requirements are areas of particular focus.`,
      sources: regulations.slice(0, 5).map(reg => ({
        name: reg.source,
        url: `https://regulatory-database.example.com/${reg.id}`,
        type: "Government Registry",
      })),
      confidence: critical > 3 ? "Medium" : "High",
      impact: `${regulations.length} regulations identified with ${critical} critical and ${important} important compliance requirements directly affecting ${company}'s market entry strategy in ${targetName}.`,
      recommendations: [
        `Establish a regulatory monitoring system for all ${regulations.length} identified regulations in ${targetName}`,
        `Prioritize immediate assessment of ${critical} critical compliance requirements`,
        `Engage local regulatory counsel in ${targetName} for jurisdiction-specific interpretation`,
        `Schedule quarterly regulatory review meetings to track amendments and enforcement trends`,
        `Map each regulation to specific operational areas within ${company} for accountability`,
      ],
      metrics: {
        regulationsFound: regulations.length,
        jurisdictionsCovered: 1,
        changesDetected: regulations.filter(r => r.kind === "New").length,
      },
    },
    complianceRequirements: {
      objective: `Convert regulatory findings into actionable compliance requirements for ${company}`,
      inputContext: `Regulations identified: ${regulations.length}`,
      findings: requirements.map(req => ({
        id: req.id,
        name: req.name,
        authority: req.authority,
        priority: req.priority,
        description: req.desc,
        due: req.due,
        status: req.status,
      })),
      keyFindings: `Derived ${total} compliance requirements from ${regulations.length} regulations. ${critical} requirements are classified as Critical priority with near-term deadlines, ${important} as Important requiring quarterly attention, and ${standard} as Standard with longer timelines. Requirements span ${Object.keys(complianceByCategory).length} compliance categories including ${Object.keys(complianceByCategory).join(", ")}.`,
      sources: [],
      confidence: "High",
      impact: `${total} actionable requirements identified across ${Object.keys(complianceByCategory).length} compliance categories. ${critical} critical requirements must be addressed within 30-60 days to avoid regulatory penalties.`,
      recommendations: [
        `Assign dedicated owners for each of the ${critical} critical requirements`,
        `Create requirement traceability matrix linking each requirement to its source regulation`,
        `Establish automated tracking for requirement compliance status and deadlines`,
        `Develop requirement-specific compliance evidence templates`,
        `Implement requirement prioritization framework based on business impact`,
      ],
      metrics: {
        totalRequirements: total,
        critical,
        important,
        standard,
      },
    },
    gapAnalysis: {
      objective: `Assess current compliance readiness against identified requirements for ${company}`,
      inputContext: `Requirements assessed: ${total}`,
      findings: gaps.map(g => ({
        reqId: g.reqId,
        title: g.title,
        description: g.description,
        priority: g.priority,
        severity: g.severity,
        currentStatus: "Not Started",
        requiredActions: `Implement compliance controls for ${g.title}`,
      })),
      keyFindings: `Identified ${gaps.length} compliance gaps representing ${critical} critical deficiencies, ${important} important shortfalls, and ${standard} standard improvements needed. ${company} currently has zero compliance readiness, requiring a comprehensive remediation program spanning all identified requirement areas.`,
      sources: [],
      confidence: "High",
      impact: `${gaps.length} gaps must be remediated before ${company} can achieve compliance in ${targetName}. ${critical} critical gaps pose immediate regulatory risk and should be addressed as top priority.`,
      recommendations: [
        `Conduct detailed gap assessment workshops for each critical compliance area`,
        `Prioritize remediation of ${critical} critical gaps within the first 30 days`,
        `Establish gap closure metrics and monthly progress reporting`,
        `Engage external auditors to validate gap assessments`,
        `Create remediation playbooks for each gap category`,
      ],
      metrics: {
        totalGaps: gaps.length,
        critical,
        open: gaps.length,
        partial: 0,
        resolved: 0,
      },
    },
    riskImpact: {
      objective: `Evaluate business and regulatory risk exposure for ${company}`,
      inputContext: `Gaps identified: ${gaps.length}`,
      findings: riskMatrix,
      riskLevel: agentRiskLevel,
      confidence: criticalRisks > 2 ? "Medium" : "High",
      impact: `${riskMatrix.length} risks identified across ${new Set(riskMatrix.map(r => r.category)).size} categories. ${criticalRisks} critical risks require immediate mitigation strategies. Total estimated risk exposure includes potential regulatory penalties, operational disruption, and market access restrictions.`,
      recommendations: [
        `Develop risk mitigation plans for all ${criticalRisks} critical risks within 30 days`,
        `Implement continuous risk monitoring and early warning indicators`,
        `Establish a risk governance framework with regular board-level reporting`,
        `Purchase appropriate insurance coverage for identified risk categories`,
        `Create scenario-based contingency plans for high-impact regulatory events`,
      ],
      metrics: {
        totalRisks: riskMatrix.length,
        critical: criticalRisks,
        high: highRisks,
        medium: mediumRisks,
        low: lowRisks,
      },
    },
    actionPlan: {
      objective: `Create executable remediation plan for ${company}`,
      inputContext: `Risks assessed: ${riskMatrix.length}, Gaps: ${gaps.length}`,
      findings: actions,
      keyFindings: `The remediation plan spans ${estimatedDays} days with ${total} actions across four phases. Phase 1 focuses on ${immediateActions.length} immediate actions addressing critical compliance gaps. Phase 2 encompasses ${shortTermActions.length} short-term initiatives for important requirements. Phase 3 includes ${mediumTermActions.length} medium-term projects, and Phase 4 covers ${longTermActions.length} long-term strategic compliance improvements.`,
      phases: [
        { name: "Immediate (0-30 days)", actions: immediateActions.length, focus: `Address ${critical} critical compliance gaps and establish foundational controls` },
        { name: "Short-term (30-90 days)", actions: shortTermActions.length, focus: `Implement ${important} important compliance requirements and monitoring systems` },
        { name: "Medium-term (90-180 days)", actions: mediumTermActions.length, focus: `Complete remaining compliance implementations and prepare for audit` },
        { name: "Long-term (180+ days)", actions: longTermActions.length, focus: `Establish ongoing compliance program, training, and continuous improvement` },
      ],
      confidence: "High",
      impact: `Total investment of $${estimatedCost.toLocaleString()} over ${estimatedDays} days will bring ${company} into compliance with all ${regulations.length} identified regulations in ${targetName}. Phased approach ensures critical risks are addressed first while building sustainable compliance infrastructure.`,
      recommendations: [
        `Establish a cross-functional compliance steering committee`,
        `Appoint a dedicated compliance program manager`,
        `Implement project management tools for tracking ${total} compliance actions`,
        `Schedule bi-weekly progress reviews with executive stakeholders`,
        `Prepare compliance evidence portfolio for regulatory audits`,
        `Build internal compliance competency through training programs`,
      ],
      metrics: {
        totalActions: total,
        estimatedCost,
        estimatedDays,
      },
    },
  };

  return analysisData;
}
