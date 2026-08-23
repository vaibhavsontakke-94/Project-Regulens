/* �"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"�
   ReguLens CORE BUNDLE � global language system master fix
   Dynamic-UI strings previously hardcoded in English:
   statuses, priorities, severities, stages, agents, verdicts, badges,
   empty states, errors, validation, charts, dropdowns, industries.
   Merged into window.CORE_I18N (loaded BEFORE app.js).
   Internal enums stay canonical English; only display text translates.
   �"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"� */
(function () {
  window.CORE_I18N = {
    en: {
      "nav.dashboard": "Dashboard",
      "nav.canILaunch": "Can I Launch?",
      "nav.feasibility": "Feasibility Analyzer",
      "nav.setupGuide": "Setup Guide",
      "nav.policyChecker": "Policy Checker",
      "nav.businessHealth": "Business Health",
      "nav.agentIntel": "Agent Intelligence",
      "nav.requirements": "Requirements",
      "nav.gapAnalysis": "Gap Analysis",
      "nav.actionPlan": "Action Plan",
      "nav.costEstimator": "Cost Estimator",
      "nav.docLibrary": "Document Library",
      "nav.regWatch": "Regulation Watch",
      "nav.updates": "Updates",
      "nav.impactAnalysis": "Impact Analysis",
      "nav.group.analyze": "ANALYZE",
      "nav.group.monitor": "MONITOR",
      "nav.group.business": "BUSINESS",
      "nav.group.intelligence": "INTELLIGENCE",
      "nav.group.workspace": "WORKSPACE",
      "nav.module.market": "Market Intelligence",
      "nav.module.compliance": "Compliance Center",
      "nav.module.risk": "Risk & Business Health",
      "nav.module.growth": "Growth & Global Network",
      "nav.module.policy": "Policy Intelligence",
      "nav.module.impact": "Impact & Scenarios",
      "nav.module.copilot": "AI Copilot",
      "nav.module.documents": "Documents & Evidence",
      "crumb.marketReadiness": "Market Readiness",
      "crumb.settings": "Settings",
      "crumb.profile": "Profile",
      "crumb.riskMatrix": "Risk Matrix",
      "crumb.network": "Growth & Global Network",
      "crumb.feasibility": "Feasibility Analyzer",
      "crumb.setupGuide": "Setup Guide",
      "crumb.policyChecker": "Policy Checker",
      "crumb.businessHealth": "Business Health",
      "pc.title": "AI Country Policy Checker",
      "pc.desc": "Ask a concrete policy or compliance question about a target market and get a grounded answer.",
      "pc.formTitle": "Your Question",
      "pc.target": "Target Market",
      "pc.industry": "Industry (optional)",
      "pc.anyIndustry": "Any industry",
      "pc.product": "Product Context (optional)",
      "pc.productPh": "e.g. mobile app processing health data",
      "pc.question": "Question",
      "pc.questionPh": "e.g. Can customer data be transferred from this market to our servers abroad?",
      "pc.run": "Check Policy",
      "pc.running": "Checking…",
      "pc.errMarket": "Please select a target market.",
      "pc.errQuestion": "Please enter your question (at least 8 characters).",
      "pc.errFailed": "Policy check failed. Please try again.",
      "pc.emptyTitle": "No policy check yet",
      "pc.emptyText": "Ask about licensing, data transfers, employment rules, taxes — anything policy-related for your target market.",
      "pc.obligations": "Obligations",
      "pc.watchouts": "Watch-outs",
      "pc.followUp": "Suggested follow-ups",
      "pc.disclaimer": "Answers are guidance only — confirm with official sources before acting.",
      "bh.title": "Business Health Monitor",
      "bh.desc": "A live scorecard computed from your compliance progress, gaps, risks and documentation — plus integrity signals.",
      "bh.emptyTitle": "No health data yet",
      "bh.emptyText": "The health monitor reads your analysis, requirement statuses and document library. Run an analysis to activate it.",
      "bh.emptyCta": "Run an analysis",
      "bh.score": "Health score",
      "bh.status.healthy": "Healthy",
      "bh.status.attention": "Needs attention",
      "bh.status.critical": "Critical",
      "bh.comp.compliance": "Compliance progress",
      "bh.comp.gaps": "Gap closure",
      "bh.comp.risk": "Risk posture",
      "bh.comp.docs": "Documentation coverage",
      "bh.stat.done": "Requirements done",
      "bh.stat.pending": "Pending",
      "bh.stat.risks": "Tracked risks",
      "bh.stat.docs": "Documents on file",
      "bh.signals": "Integrity & fraud signals",
      "bh.refresh": "Re-scan",
      "bh.disclaimer": "Signals are rule-based checks over your own project data — they highlight anomalies, not proven fraud.",
      "bh.sig.none": "No integrity signals detected. Your project data looks consistent.",
      "bh.sig.criticalDue": "{n} critical requirements due within 30 days are still open — immediate attention recommended.",
      "bh.sig.criticalDueFew": "{n} critical requirement(s) due soon remain open.",
      "bh.sig.stalled": "No requirement is in progress while several remain pending — the project may be stalled.",
      "bh.sig.unowned": "{n} action items have no assigned owner — accountability gaps increase slip risk.",
      "bh.sig.compression": "{n} action items share the next 30 days — timeline compression raises execution risk.",
      "bh.sig.thinDocs": "Only {n} document(s) on file for a project of this scope — evidence coverage is thin.",
      "bh.sig.riskCluster": "{n} high-severity risks are still open — a concentrated exposure cluster.",
      "copied": "Copied to clipboard.",
      "nav.docChecklist": "Evidence Checklist",
      "nav.coFounder": "Co-Founder Finder",
      "nav.investorHub": "Investor Readiness",
      "crumb.docChecklist": "Evidence Checklist",
      "crumb.coFounder": "Co-Founder Finder",
      "crumb.investorHub": "Investor Readiness",
      "growth.cfCard": "Co-Founder Finder",
      "growth.cfText": "See which roles your launch actually needs — derived from your analysis — and copy a ready-to-send search brief.",
      "growth.cfCta": "Open Co-Founder Finder",
      "growth.ihCard": "Investor Readiness",
      "growth.ihText": "Check how investable your project looks today and generate a one-pager draft from your real numbers.",
      "growth.ihCta": "Open Investor Readiness",
      "dc.title": "Document Checklist & Templates",
      "dc.desc": "The evidence your requirements imply — with starting-point templates for each document type.",
      "dc.emptyTitle": "No checklist yet",
      "dc.emptyText": "Run an analysis first — the checklist maps each requirement to the documents that prove compliance.",
      "dc.emptyCta": "Run an analysis",
      "dc.openLibrary": "Open library",
      "dc.coverage": "{n}/{m} documents on file",
      "dc.template": "Generate template",
      "dc.generating": "Generating…",
      "dc.modeSkeleton": "Standard outline",
      "dc.errFailed": "Template generation failed.",
      "dc.copy": "Copy text",
      "cf.title": "Co-Founder Finder",
      "cf.desc": "Your analysis, translated into the team you need. Role priorities are computed from your real project signals.",
      "cf.copyBrief": "Copy search brief",
      "cf.emptyTitle": "No team profile yet",
      "cf.emptyText": "Run an analysis first — role priorities are derived from your requirements, risks and cost profile.",
      "cf.emptyCta": "Run an analysis",
      "cf.note": "Priorities are heuristic guidance from your own project data — not a substitute for your judgement.",
      "cf.tier.high": "High priority now",
      "cf.tier.medium": "Worth adding",
      "cf.tier.nice": "Nice to have",
      "cf.role.compliance": "Compliance / Legal Lead",
      "cf.look.compliance": "Has run certification or licensing processes end-to-end before",
      "cf.venue.compliance": "Look in industry compliance associations and regulatory alumni networks.",
      "cf.role.dpo": "Data Protection Specialist",
      "cf.look.dpo": "Practical experience with data-protection authorities, not just theory",
      "cf.venue.dpo": "Look among privacy professionals in your sector's user groups.",
      "cf.role.local": "Local Market Expert ({target})",
      "cf.look.local": "Built or launched B2B products in this market before",
      "cf.look.local2": "Strong network with local regulators or industry bodies",
      "cf.venue.local": "Look in local founder communities and market-entry agencies.",
      "cf.role.reganalyst": "Regulatory Affairs Analyst",
      "cf.look.reganalyst": "Comfortable turning legal texts into tracked engineering tasks",
      "cf.venue.reganalyst": "Look among consultants serving your industry's compliance teams.",
      "cf.role.tech": "Technical Co-Founder",
      "cf.look.tech": "Can own architecture while carrying security/compliance constraints",
      "cf.venue.tech": "Look in engineering communities with regulated-industry focus.",
      "cf.role.finance": "Finance & Fundraising Lead",
      "cf.look.finance": "Models unit economics under compliance cost pressure",
      "cf.venue.finance": "Look among finance operators with launch-stage experience.",
      "cf.why.compliance": "{critical} critical requirements must be closed for {target} — someone needs to own this end-to-end.",
      "cf.why.dpo": "{privacy} requirements in your plan involve personal-data handling — dedicated expertise pays off fast here.",
      "cf.why.local": "Launching into {target} from {company}'s home base carries local-context risk across {total} requirements.",
      "cf.why.reganalyst": "{total} tracked requirements need continuous translation into engineering work — more than ad-hoc effort.",
      "cf.why.tech": "Technical impact is scored {tech}/100 in your analysis — architecture decisions will carry compliance weight.",
      "cf.why.finance": "Financial impact is scored {fin}/100 in your analysis — budget discipline decides whether you reach launch.",
      "ih.title": "Investor Readiness",
      "ih.desc": "How fundable your project looks today, what investors will probe, and a one-pager draft built from your numbers.",
      "ih.generate": "Generate one-pager draft",
      "ih.generating": "Drafting…",
      "ih.emptyTitle": "Not enough data yet",
      "ih.emptyText": "Run an analysis first — investor readiness is scored from your compliance, risk and documentation state.",
      "ih.emptyCta": "Run an analysis",
      "ih.stat.readiness": "Compliance readiness",
      "ih.stat.cost": "Estimated cost",
      "ih.stat.days": "Days to ready",
      "ih.stat.open": "Open requirements",
      "ih.asks": "What investors will ask",
      "ih.briefTitle": "One-pager draft",
      "ih.ask.clearance": "Show me your regulatory clearance status.",
      "ih.ask.clearanceVal": "{done}/{total} done",
      "ih.ask.risk": "What keeps you up at night? (top risks)",
      "ih.ask.timeline": "How realistic is your timeline?",
      "ih.ask.docs": "Where is your evidence trail?",
      "ih.ask.team": "Who owns compliance on the team?",
      "ih.ask.teamVal": "see Co-Founder tab",
      "risk.title": "Risk Matrix",
      "risk.desc": "Probability and impact of every risk identified by the analysis agents.",
      "risk.empty.title": "No risk data yet",
      "risk.empty.text": "Run a regulatory analysis and the Risk Agent findings will appear here automatically.",
      "risk.empty.cta": "Start an Analysis",
      "risk.matrix.title": "Probability × Impact",
      "risk.dist.title": "Severity Distribution",
      "risk.register.title": "Risk Register",
      "risk.col.risk": "Risk",
      "risk.col.category": "Category",
      "risk.col.severity": "Severity",
      "risk.col.probability": "P",
      "risk.col.impact": "I",
      "risk.col.status": "Status",
      "risk.stat.total": "Total Risks",
      "risk.stat.elevated": "Elevated (H+M)",
      "risk.stat.open": "Open",
      "growth.title": "Growth & Global Network",
      "growth.desc": "Find co-founders, partners and investors aligned with your target market and industry.",
      "growth.empty.title": "Network matching is being prepared",
      "growth.empty.text": "Direct founder-to-founder and investor matching needs a community pool — it is on our roadmap. Meanwhile, the two tools above work from your own analysis.",
      "growth.empty.cta": "Complete Company Profile",
      "feas.title": "Business Feasibility Analyzer",
      "feas.desc": "Describe your business idea and get an honest feasibility evaluation for your target market.",
      "feas.formTitle": "Your Business Idea",
      "feas.company": "Company",
      "feas.companyPh": "Your company name",
      "feas.product": "Product / Idea",
      "feas.productPh": "What are you building?",
      "feas.origin": "Origin Country",
      "feas.selectCountry": "Select country…",
      "feas.target": "Target Market",
      "feas.selectMarket": "Select target market…",
      "feas.industry": "Industry",
      "feas.selectIndustry": "Select industry…",
      "feas.notes": "Notes (optional)",
      "feas.notesPh": "Anything else the analyst should know — budget, team, timeline…",
      "feas.run": "Evaluate Feasibility",
      "feas.running": "Evaluating…",
      "feas.errCompany": "Please enter your company name.",
      "feas.errProduct": "Please describe your product or idea.",
      "feas.errFailed": "Feasibility evaluation failed. Please try again.",
      "feas.emptyTitle": "No feasibility report yet",
      "feas.emptyText": "Fill in the form above and run the analyzer to see whether your idea is viable in the selected market.",
      "feas.fitScore": "Market fit score",
      "feas.competition": "Competition",
      "feas.capital": "Estimated capital",
      "feas.timeline": "Time to launch",
      "feas.strengths": "Strengths",
      "feas.concerns": "Concerns",
      "feas.risks": "Key Risks",
      "feas.recommendations": "Recommendations",
      "feas.modeAi": "AI analysis",
      "feas.modeDemo": "Deterministic estimate (knowledge base)",
      "feas.disclaimer": "Estimates are directional guidance, not financial or legal advice.",
      "guide.title": "Step-by-Step Setup Guide",
      "guide.desc": "Your launch path as a sequential checklist, generated from your analysis. Progress is saved locally.",
      "guide.reset": "Reset progress",
      "guide.emptyTitle": "No setup plan available yet",
      "guide.emptyText": "Run a market analysis first — the setup guide builds itself from your action plan.",
      "guide.emptyCta": "Run an analysis",
      "guide.phase1": "Phase 1 · Immediate (0–30 days)",
      "guide.phase2": "Phase 2 · Short-term (1–3 months)",
      "guide.phase3": "Phase 3 · Medium-term (3–6 months)",
      "guide.phase4": "Phase 4 · Long-term (6+ months)",
      "sev.important": "Important",
      "sev.standard": "Standard",
      "help.title": "Need Help?",
      "help.text": "Talk to our compliance expert",
      "help.book": "Book a Call",
      "crumb.marketReadiness": "Market Readiness",
      "crumb.settings": "Settings",
      "crumb.profile": "Profile",
      "charts.empty": "No data to display yet.",
      "dashboard.totalRequirements": "Total Requirements",
      "dashboard.riskLevel": "Risk Level",
      "dashboard.estimatedDays": "Estimated Days",
      "dashboard.complianceProgress": "Compliance Progress",
      "cost.total": "Total Estimated Cost",
      "gap.totalGaps": "Open Gaps",
      "gap.critical": "Critical",
      "gap.high": "High",
      "gap.medium": "Medium",
      "gap.low": "Low",
      "req.statusCompleted": "Completed",
      "req.statusInProgress": "In Progress",
      "req.statusPending": "Pending",
      "req.statusNA": "N/A",
      "sev.critical": "Critical",
      "sev.high": "High",
      "sev.medium": "Medium",
      "sev.low": "Low",
      "sev.info": "Info",
      "prio.high": "High Priority",
      "prio.medium": "Medium Priority",
      "prio.low": "Low Priority",
      "time.day": "day",
      "time.days": "days",
      "time.publishedOn": "Published on {d}",
      "time.more": "+{n} more⬦",
      "common.update": "Update",
      "common.complete": "Complete",
      "common.none": "None",
      "common.viewDetails": "View details",
      "reg.label": "Regulation",
      "reg.kind.new": "New Regulation",
      "reg.kind.amendment": "Amendment",
      "reg.kind.update": "Update",
      "reg.kind.repeal": "Repeal",
      "reg.kind.guidance": "Guidance",
      "stage.research": "Market Research",
      "stage.requirements": "Requirements Mapping",
      "stage.gaps": "Gap Analysis",
      "stage.risks": "Risk Assessment",
      "stage.actions": "Action Planning",
      "stage.readiness": "Readiness Scoring",
      "agent.name.research": "Research Agent",
      "agent.name.requirements": "Requirements Agent",
      "agent.name.gaps": "Gap Agent",
      "agent.name.risk": "Risk Agent",
      "agent.name.actions": "Action Agent",
      "agent.purpose.research": "Identifies regulations that may apply to your product",
      "agent.purpose.requirements": "Converts regulations into concrete compliance requirements",
      "agent.purpose.gaps": "Finds what is missing between you and compliance",
      "agent.purpose.risk": "Scores launch risk and business impact",
      "agent.purpose.actions": "Builds a prioritized remediation plan",
      "ai.byPriority": "Requirements by Priority",
      "ai.bySeverity": "Gaps by Severity",
      "ai.countReqs": "{n} requirements",
      "ai.countGaps": "{n} gaps",
      "ai.more": "+{n} more⬦",
      "ai.sum.research": "Identified {n} potentially applicable regulatory sources{extra}.",
      "ai.sum.reqs": "Generated {n} compliance requirements{extra}.",
      "ai.sum.gaps": "Found {n} compliance gaps{extra}.",
      "ai.sum.readiness": "Readiness score: {p}%{extra}",
      "ai.sum.readinessPlain": "Calculated market readiness score.",
      "ai.sum.actions": "Generated {n} prioritized remediation actions{extra}.",
      "ai.extra.highConf": " ({h} high-confidence)",
      "ai.extra.critical": " ({h} critical)",
      "ai.extra.highPrio": " ({h} high-priority)",
      "ai.extra.risk": " · Risk level: {r}",
      "ai.extra.cost": " · Est. cost: {c}",
      "verdict.noAnalysis": "Run an analysis to get your launch verdict.",
      "verdict.prompt": "Enter your company and product details to see if you are ready to launch.",
      "verdict.ready": "{c} is {p}% ready to launch {pr} in {m}.",
      "verdict.pendingLeft": "Resolve the remaining {n} pending requirements before entering the market to reduce compliance risk.",
      "verdict.allDone": "All requirements are addressed � you are ready to proceed.",
      "badge.ready": "READY FOR LAUNCH",
      "badge.conditions": "CONDITIONAL GO",
      "badge.highrisk": "HIGH RISK",
      "badge.notready": "NOT READY",
      "readiness.excellent": "Excellent",
      "readiness.moderate": "Moderate",
      "readiness.low": "Low",
      "readiness.excellentFull": "Strong regulatory readiness across all critical areas.",
      "readiness.moderateFull": "Good foundation with several areas requiring attention.",
      "readiness.lowFull": "Significant compliance work is required before launch.",
      "empty.topPending.doneTitle": "All caught up",
      "empty.topPending.doneDesc": "No pending requirements right now.",
      "empty.topPending.noneTitle": "Nothing pending yet",
      "empty.topPending.noneDesc": "Run an analysis to generate your priority queue.",
      "empty.dashTl.doneTitle": "Plan on track",
      "empty.dashTl.doneDesc": "Your action plan has active milestones.",
      "empty.dashTl.noneTitle": "No timeline yet",
      "empty.dashTl.noneDesc": "Complete an analysis to build your launch timeline.",
      "empty.watch.flagTitle": "No flagged changes",
      "empty.watch.flagDesc": "Tracked regulations are stable.",
      "empty.watch.noneTitle": "Nothing tracked yet",
      "empty.watch.noneDesc": "Track markets to monitor regulation changes.",
      "empty.gaps": "No gaps detected.",
      "empty.actions.doneTitle": "All actions complete",
      "empty.actions.doneDesc": "Every remediation step is done.",
      "empty.actions.noneTitle": "No actions yet",
      "empty.actions.noneDesc": "Actions are generated after an analysis completes.",
      "empty.costs.hasData": "Costs are estimated from your pending items and market profile.",
      "empty.costs.none": "Run an analysis to estimate your compliance budget.",
      "empty.updates.hasDataTitle": "Latest updates",
      "empty.updates.hasDataDesc": "Recent changes affecting your tracked markets.",
      "empty.updates.noneTitle": "No updates yet",
      "empty.updates.noneDesc": "Updates appear when tracked regulations change.",
      "update.fallback": "Update",
      "empty.impact.hasDataTitle": "Impact overview",
      "empty.impact.hasDataDesc": "How regulatory changes affect your business.",
      "empty.impact.noneTitle": "No impact data",
      "empty.impact.noneDesc": "Impact insights appear after tracking regulations.",
      "docs.emptyTitle": "No documents yet",
      "docs.emptyDesc": "Upload licenses, certificates and compliance files to keep everything in one place.",
      "analyze.cta": "Analyze",
      "analyze.running": "Analyzing⬦",
      "analyze.complete": "Analysis complete",
      "err.title": "Analysis could not be completed",
      "err.stage": "Stage",
      "err.reason": "Reason",
      "err.error": "Error",
      "err.action": "Recommended action",
      "err.details": "Details",
      "err.retryBtn": "Retry Analysis",
      "err.msg.SERVER_UNREACHABLE": "Cannot reach the ReguLens server. Check your connection and try again.",
      "err.msg.REQUEST_FAILED": "The request failed unexpectedly. Please try again.",
      "err.msg.AI_NOT_CONFIGURED": "AI engine is not configured on this server.",
      "err.msg.PROVIDER_AUTH_REJECTED": "The AI provider rejected the credentials configured on this server.",
      "err.msg.PROVIDER_MODEL_UNAVAILABLE": "The AI model is temporarily unavailable. Please retry shortly.",
      "err.msg.RATE_LIMITED": "The AI provider rate limit was hit. Wait a moment and retry.",
      "err.msg.PROVIDER_ERROR": "The AI provider returned an unexpected error.",
      "err.msg.PROVIDER_UNREACHABLE": "Could not reach the AI provider network.",
      "err.msg.MALFORMED_RESPONSE": "The AI returned a response that could not be parsed.",
      "err.msg.STAGE_FAILED": "One of the analysis stages failed.",
      "err.rec.PROVIDER_AUTH_REJECTED": "Verify the AI provider API key in the server configuration.",
      "err.rec.PROVIDER_MODEL_UNAVAILABLE": "Try again in a few minutes or switch to Demo Mode.",
      "err.rec.RATE_LIMITED": "Wait about a minute, then press Retry Analysis.",
      "err.rec.DEFAULT": "Press Retry Analysis. If it keeps failing, switch to Demo Mode.",
      "validate.company": "Please enter your company name.",
      "validate.product": "Please describe your product or service.",
      "validate.target": "Please select a target market.",
      "validate.industry": "Please select your industry.",
      "act.total": "Total Actions",
      "act.critical": "Critical",
      "act.completed": "Completed",
      "act.daysReady": "Days to Ready",
      "plan.total": "Total {d} days (~{w} weeks)",
      "plan.criticalPath": "critical path: {p}",
      "plan.runToCompute": "Run an analysis to compute your launch plan.",
      "plan.actions": "{n} actions",
      "plan.dayRange": "Day {a}�{b}",
      "dd.target": "Select target market⬦",
      "dd.industry": "Select industry⬦",
      "cmd.noMatch": "No commands match \u201C{q}\u201D",
      "industry.fintech": "FinTech",
      "industry.banking-financial": "Banking & Financial Services",
      "industry.healthcare": "Healthcare",
      "industry.healthtech": "HealthTech",
      "industry.edtech": "EdTech",
      "industry.ecommerce": "E-commerce",
      "industry.saas": "SaaS",
      "industry.ai-ml": "AI & Machine Learning",
      "industry.manufacturing": "Manufacturing",
      "industry.retail": "Retail",
      "industry.food-beverage": "Food & Beverage",
      "industry.logistics": "Logistics & Supply Chain",
      "industry.energy": "Energy",
      "industry.automotive": "Automotive",
      "industry.telecommunications": "Telecommunications",
      "industry.insurance": "Insurance",
      "industry.pharmaceuticals": "Pharmaceuticals",
      "industry.travel-tourism": "Travel & Tourism",
      "industry.general": "General / Other"
    },

    es: {
      "nav.dashboard": "Panel",
      "nav.canILaunch": "\u00BFPuedo Lanzar?",
      "nav.agentIntel": "Inteligencia de Agentes",
      "nav.requirements": "Requisitos",
      "nav.gapAnalysis": "An\u00E1lisis de Brechas",
      "nav.actionPlan": "Plan de Acci\u00F3n",
      "nav.costEstimator": "Estimador de Costos",
      "nav.docLibrary": "Biblioteca de Documentos",
      "nav.regWatch": "Vigilancia Regulatoria",
      "nav.updates": "Actualizaciones",
      "nav.impactAnalysis": "An\u00E1lisis de Impacto",
      "nav.group.analyze": "ANALIZAR",
      "nav.group.monitor": "MONITOREAR",
      "help.title": "\u00BFNecesitas ayuda?",
      "help.text": "Habla con nuestro experto en cumplimiento",
      "help.book": "Reservar una llamada",
      "crumb.marketReadiness": "Preparaci\u00F3n para el Mercado",
      "crumb.settings": "Configuraci\u00F3n",
      "crumb.profile": "Perfil",
      "charts.empty": "A\u00FAn no hay datos para mostrar.",
      "dashboard.totalRequirements": "Requisitos Totales",
      "dashboard.riskLevel": "Nivel de Riesgo",
      "dashboard.estimatedDays": "D\u00EDas Estimados",
      "dashboard.complianceProgress": "Progreso de Cumplimiento",
      "cost.total": "Costo Total Estimado",
      "gap.totalGaps": "Brechas Abiertas",
      "gap.critical": "Cr\u00EDticas",
      "gap.high": "Altas",
      "gap.medium": "Medias",
      "gap.low": "Bajas",
      "req.statusCompleted": "Completado",
      "req.statusInProgress": "En Progreso",
      "req.statusPending": "Pendiente",
      "req.statusNA": "N/D",
      "sev.critical": "Cr\u00EDtica",
      "sev.high": "Alta",
      "sev.medium": "Media",
      "sev.low": "Baja",
      "sev.info": "Informaci\u00F3n",
      "prio.high": "Prioridad Alta",
      "prio.medium": "Prioridad Media",
      "prio.low": "Prioridad Baja",
      "time.day": "d\u00EDa",
      "time.days": "d\u00EDas",
      "time.publishedOn": "Publicado el {d}",
      "time.more": "+{n} m\u00E1s⬦",
      "common.update": "Actualizar",
      "common.complete": "Completo",
      "common.none": "Ninguno",
      "common.viewDetails": "Ver detalles",
      "reg.label": "Regulaci\u00F3n",
      "reg.kind.new": "Nueva Regulaci\u00F3n",
      "reg.kind.amendment": "Enmienda",
      "reg.kind.update": "Actualizaci\u00F3n",
      "reg.kind.repeal": "Derogaci\u00F3n",
      "reg.kind.guidance": "Gu\u00EDa",
      "stage.research": "Investigaci\u00F3n de Mercado",
      "stage.requirements": "Mapeo de Requisitos",
      "stage.gaps": "An\u00E1lisis de Brechas",
      "stage.risks": "Evaluaci\u00F3n de Riesgos",
      "stage.actions": "Planificaci\u00F3n de Acciones",
      "stage.readiness": "Puntuaci\u00F3n de Preparaci\u00F3n",
      "agent.name.research": "Agente de Investigaci\u00F3n",
      "agent.name.requirements": "Agente de Requisitos",
      "agent.name.gaps": "Agente de Brechas",
      "agent.name.risk": "Agente de Riesgos",
      "agent.name.actions": "Agente de Acciones",
      "agent.purpose.research": "Identifica regulaciones que podr\u00EDan aplicar a tu producto",
      "agent.purpose.requirements": "Convierte regulaciones en requisitos de cumplimiento concretos",
      "agent.purpose.gaps": "Encuentra lo que falta entre tu empresa y el cumplimiento",
      "agent.purpose.risk": "Eval\u00FAa el riesgo de lanzamiento y el impacto empresarial",
      "agent.purpose.actions": "Construye un plan de remediaci\u00F3n priorizado",
      "ai.byPriority": "Requisitos por Prioridad",
      "ai.bySeverity": "Brechas por Severidad",
      "ai.countReqs": "{n} requisitos",
      "ai.countGaps": "{n} brechas",
      "ai.more": "+{n} m\u00E1s⬦",
      "ai.sum.research": "Se identificaron {n} fuentes regulatorias potencialmente aplicables{extra}.",
      "ai.sum.reqs": "Se generaron {n} requisitos de cumplimiento{extra}.",
      "ai.sum.gaps": "Se encontraron {n} brechas de cumplimiento{extra}.",
      "ai.sum.readiness": "Puntuaci\u00F3n de preparaci\u00F3n: {p}%{extra}",
      "ai.sum.readinessPlain": "Se calcul\u00F3 la puntuaci\u00F3n de preparaci\u00F3n para el mercado.",
      "ai.sum.actions": "Se generaron {n} acciones de remediaci\u00F3n priorizadas{extra}.",
      "ai.extra.highConf": " ({h} de alta confianza)",
      "ai.extra.critical": " ({h} cr\u00EDticos)",
      "ai.extra.highPrio": " ({h} de alta prioridad)",
      "ai.extra.risk": " \u00B7 Nivel de riesgo: {r}",
      "ai.extra.cost": " \u00B7 Costo estimado: {c}",
      "verdict.noAnalysis": "Ejecuta un an\u00E1lisis para obtener tu veredicto de lanzamiento.",
      "verdict.prompt": "Ingresa los datos de tu empresa y producto para saber si est\u00E1s listo para lanzar.",
      "verdict.ready": "{c} est\u00E1 {p}% listo para lanzar {pr} en {m}.",
      "verdict.pendingLeft": "Resuelve los {n} requisitos pendientes antes de entrar al mercado para reducir el riesgo regulatorio.",
      "verdict.allDone": "Todos los requisitos est\u00E1n resueltos \u2014 est\u00E1s listo para proceder.",
      "badge.ready": "LISTO PARA LANZAR",
      "badge.conditions": "APROBACI\u00D3N CONDICIONAL",
      "badge.highrisk": "ALTO RIESGO",
      "badge.notready": "NO LISTO",
      "readiness.excellent": "Excelente",
      "readiness.moderate": "Moderada",
      "readiness.low": "Baja",
      "readiness.excellentFull": "S\u00F3lida preparaci\u00F3n regulatoria en todas las \u00E1reas cr\u00EDticas.",
      "readiness.moderateFull": "Buena base con varias \u00E1reas que requieren atenci\u00F3n.",
      "readiness.lowFull": "Se requiere trabajo de cumplimiento significativo antes del lanzamiento.",
      "empty.topPending.doneTitle": "Todo al d\u00EDa",
      "empty.topPending.doneDesc": "No hay requisitos pendientes por ahora.",
      "empty.topPending.noneTitle": "Nada pendiente todav\u00EDa",
      "empty.topPending.noneDesc": "Ejecuta un an\u00E1lisis para generar tu cola de prioridades.",
      "empty.dashTl.doneTitle": "Plan en camino",
      "empty.dashTl.doneDesc": "Tu plan de acci\u00F3n tiene hitos activos.",
      "empty.dashTl.noneTitle": "A\u00FAn no hay cronograma",
      "empty.dashTl.noneDesc": "Completa un an\u00E1lisis para construir tu cronograma de lanzamiento.",
      "empty.watch.flagTitle": "Sin cambios marcados",
      "empty.watch.flagDesc": "Las regulaciones monitoreadas son estables.",
      "empty.watch.noneTitle": "Nada monitoreado todav\u00EDa",
      "empty.watch.noneDesc": "Sigue mercados para monitorear cambios regulatorios.",
      "empty.gaps": "No se detectaron brechas.",
      "empty.actions.doneTitle": "Todas las acciones completadas",
      "empty.actions.doneDesc": "Cada paso de remediaci\u00F3n est\u00E1 hecho.",
      "empty.actions.noneTitle": "A\u00FAn no hay acciones",
      "empty.actions.noneDesc": "Las acciones se generan cuando termina un an\u00E1lisis.",
      "empty.costs.hasData": "Los costos se estiman seg\u00FAn tus elementos pendientes y tu perfil de mercado.",
      "empty.costs.none": "Ejecuta un an\u00E1lisis para estimar tu presupuesto de cumplimiento.",
      "empty.updates.hasDataTitle": "\u00DAltimas actualizaciones",
      "empty.updates.hasDataDesc": "Cambios recientes que afectan tus mercados monitoreados.",
      "empty.updates.noneTitle": "A\u00FAn no hay actualizaciones",
      "empty.updates.noneDesc": "Las actualizaciones aparecen cuando cambian las regulaciones monitoreadas.",
      "update.fallback": "Actualizaci\u00F3n",
      "empty.impact.hasDataTitle": "Resumen de impacto",
      "empty.impact.hasDataDesc": "C\u00F3mo los cambios regulatorios afectan tu negocio.",
      "empty.impact.noneTitle": "Sin datos de impacto",
      "empty.impact.noneDesc": "Las ideas de impacto aparecen tras seguir regulaciones.",
      "docs.emptyTitle": "A\u00FAn no hay documentos",
      "docs.emptyDesc": "Sube licencias, certificados y archivos de cumplimiento para tenerlos todos en un solo lugar.",
      "analyze.cta": "Analizar",
      "analyze.running": "Analizando⬦",
      "analyze.complete": "An\u00E1lisis completado",
      "err.title": "El an\u00E1lisis no pudo completarse",
      "err.stage": "Etapa",
      "err.reason": "Motivo",
      "err.error": "Error",
      "err.action": "Acci\u00F3n recomendada",
      "err.details": "Detalles",
      "err.retryBtn": "Reintentar An\u00E1lisis",
      "err.msg.SERVER_UNREACHABLE": "No se puede conectar con el servidor ReguLens. Verifica tu conexi\u00F3n e int\u00E9ntalo de nuevo.",
      "err.msg.REQUEST_FAILED": "La solicitud fall\u00F3 inesperadamente. Int\u00E9ntalo de nuevo.",
      "err.msg.AI_NOT_CONFIGURED": "El motor de IA no est\u00E1 configurado en este servidor.",
      "err.msg.PROVIDER_AUTH_REJECTED": "El proveedor de IA rechaz\u00F3 las credenciales configuradas en este servidor.",
      "err.msg.PROVIDER_MODEL_UNAVAILABLE": "El modelo de IA no est\u00E1 disponible temporalmente. Reintenta en breve.",
      "err.msg.RATE_LIMITED": "Se alcanz\u00F3 el l\u00EDmite de solicitudes del proveedor de IA. Espera un momento y reintenta.",
      "err.msg.PROVIDER_ERROR": "El proveedor de IA devolvi\u00F3 un error inesperado.",
      "err.msg.PROVIDER_UNREACHABLE": "No se pudo alcanzar la red del proveedor de IA.",
      "err.msg.MALFORMED_RESPONSE": "La IA devolvi\u00F3 una respuesta que no se pudo procesar.",
      "err.msg.STAGE_FAILED": "Una de las etapas del an\u00E1lisis fall\u00F3.",
      "err.rec.PROVIDER_AUTH_REJECTED": "Verifica la clave API del proveedor de IA en la configuraci\u00F3n del servidor.",
      "err.rec.PROVIDER_MODEL_UNAVAILABLE": "Reintenta en unos minutos o cambia al Modo Demo.",
      "err.rec.RATE_LIMITED": "Espera alrededor de un minuto y pulsa Reintentar An\u00E1lisis.",
      "err.rec.DEFAULT": "Pulsa Reintentar An\u00E1lisis. Si sigue fallando, cambia al Modo Demo.",
      "validate.company": "Ingresa el nombre de tu empresa.",
      "validate.product": "Describe tu producto o servicio.",
      "validate.target": "Selecciona un mercado objetivo.",
      "validate.industry": "Selecciona tu industria.",
      "act.total": "Acciones Totales",
      "act.critical": "Cr\u00EDticas",
      "act.completed": "Completadas",
      "act.daysReady": "D\u00EDas para estar Listo",
      "plan.total": "Total {d} d\u00EDas (~{w} semanas)",
      "plan.criticalPath": "ruta cr\u00EDtica: {p}",
      "plan.runToCompute": "Ejecuta un an\u00E1lisis para calcular tu plan de lanzamiento.",
      "plan.actions": "{n} acciones",
      "plan.dayRange": "D\u00EDa {a}\u2013{b}",
      "dd.target": "Selecciona mercado objetivo⬦",
      "dd.industry": "Selecciona industria⬦",
      "cmd.noMatch": "Ning\u00FAn comando coincide con \u201C{q}\u201D",
      "industry.fintech": "FinTech",
      "industry.banking-financial": "Banca y Servicios Financieros",
      "industry.healthcare": "Salud",
      "industry.healthtech": "HealthTech",
      "industry.edtech": "EdTech",
      "industry.ecommerce": "Comercio Electr\u00F3nico",
      "industry.saas": "SaaS",
      "industry.ai-ml": "IA y Aprendizaje Autom\u00E1tico",
      "industry.manufacturing": "Manufactura",
      "industry.retail": "Venta Minorista",
      "industry.food-beverage": "Alimentos y Bebidas",
      "industry.logistics": "Log\u00EDstica y Cadena de Suministro",
      "industry.energy": "Energ\u00EDa",
      "industry.automotive": "Automotriz",
      "industry.telecommunications": "Telecomunicaciones",
      "industry.insurance": "Seguros",
      "industry.pharmaceuticals": "Farmac\u00E9utica",
      "industry.travel-tourism": "Viajes y Turismo",
      "industry.general": "General / Otro"
    },
        fr: {
      "nav.dashboard": "Tableau de Bord",
      "nav.canILaunch": "Puis-je Lancer ?",
      "nav.agentIntel": "Intelligence des Agents",
      "nav.requirements": "Exigences",
      "nav.gapAnalysis": "Analyse des �0carts",
      "nav.actionPlan": "Plan d'Action",
      "nav.costEstimator": "Estimateur de Coûts",
      "nav.docLibrary": "Bibliothèque de Documents",
      "nav.regWatch": "Veille Réglementaire",
      "nav.updates": "Mises à Jour",
      "nav.impactAnalysis": "Analyse d'Impact",
      "nav.group.analyze": "ANALYSER",
      "nav.group.monitor": "SURVEILLER",
      "help.title": "Besoin d'aide ?",
      "help.text": "Parlez à notre expert en conformité",
      "help.book": "Réserver un appel",
      "crumb.marketReadiness": "Préparation au Marché",
      "crumb.settings": "Paramètres",
      "crumb.profile": "Profil",
      "charts.empty": "Aucune donnée à afficher pour le moment.",
      "dashboard.totalRequirements": "Total des Exigences",
      "dashboard.riskLevel": "Niveau de Risque",
      "dashboard.estimatedDays": "Jours Estimés",
      "dashboard.complianceProgress": "Progression de Conformité",
      "cost.total": "Coût Total Estimé",
      "gap.totalGaps": "�0carts Ouverts",
      "gap.critical": "Critiques",
      "gap.high": "�0levés",
      "gap.medium": "Moyens",
      "gap.low": "Faibles",
      "req.statusCompleted": "Terminé",
      "req.statusInProgress": "En Cours",
      "req.statusPending": "En Attente",
      "req.statusNA": "S/O",
      "sev.critical": "Critique",
      "sev.high": "�0levée",
      "sev.medium": "Moyenne",
      "sev.low": "Faible",
      "sev.info": "Info",
      "prio.high": "Priorité Haute",
      "prio.medium": "Priorité Moyenne",
      "prio.low": "Priorité Basse",
      "time.day": "jour",
      "time.days": "jours",
      "time.publishedOn": "Publié le {d}",
      "time.more": "+{n} autres⬦",
      "common.update": "Mettre à jour",
      "common.complete": "Complet",
      "common.none": "Aucun",
      "common.viewDetails": "Voir les détails",
      "reg.label": "Règlement",
      "reg.kind.new": "Nouveau Règlement",
      "reg.kind.amendment": "Amendement",
      "reg.kind.update": "Mise à jour",
      "reg.kind.repeal": "Abrogation",
      "reg.kind.guidance": "Guide",
      "stage.research": "Recherche de Marché",
      "stage.requirements": "Cartographie des Exigences",
      "stage.gaps": "Analyse des �0carts",
      "stage.risks": "�0valuation des Risques",
      "stage.actions": "Planification des Actions",
      "stage.readiness": "Score de Préparation",
      "agent.name.research": "Agent de Recherche",
      "agent.name.requirements": "Agent des Exigences",
      "agent.name.gaps": "Agent des �0carts",
      "agent.name.risk": "Agent des Risques",
      "agent.name.actions": "Agent des Actions",
      "agent.purpose.research": "Identifie les règlements pouvant s'appliquer à votre produit",
      "agent.purpose.requirements": "Convertit les règlements en exigences de conformité concrètes",
      "agent.purpose.gaps": "Trouve ce qui manque entre vous et la conformité",
      "agent.purpose.risk": "�0value le risque de lancement et l'impact commercial",
      "agent.purpose.actions": "Construit un plan de remédiation priorisé",
      "ai.byPriority": "Exigences par Priorité",
      "ai.bySeverity": "�0carts par Sévérité",
      "ai.countReqs": "{n} exigences",
      "ai.countGaps": "{n} écarts",
      "ai.more": "+{n} autres⬦",
      "ai.sum.research": "{n} sources réglementaires potentiellement applicables identifiées{extra}.",
      "ai.sum.reqs": "{n} exigences de conformité générées{extra}.",
      "ai.sum.gaps": "{n} écarts de conformité trouvés{extra}.",
      "ai.sum.readiness": "Score de préparation : {p}%{extra}",
      "ai.sum.readinessPlain": "Score de préparation au marché calculé.",
      "ai.sum.actions": "{n} actions de remédiation priorisées générées{extra}.",
      "ai.extra.highConf": " ({h} haute confiance)",
      "ai.extra.critical": " ({h} critiques)",
      "ai.extra.highPrio": " ({h} haute priorité)",
      "ai.extra.risk": " · Niveau de risque : {r}",
      "ai.extra.cost": " · Coût estimé : {c}",
      "verdict.noAnalysis": "Lancez une analyse pour obtenir votre verdict de lancement.",
      "verdict.prompt": "Saisissez les détails de votre entreprise et produit pour savoir si vous êtes prêt à lancer.",
      "verdict.ready": "{c} est {p}% prêt à lancer {pr} sur {m}.",
      "verdict.pendingLeft": "Résolvez les {n} exigences restantes avant d'entrer sur le marché afin de réduire le risque réglementaire.",
      "verdict.allDone": "Toutes les exigences sont traitées � vous pouvez procéder.",
      "badge.ready": "PR�`T POUR LE LANCEMENT",
      "badge.conditions": "GO CONDITIONNEL",
      "badge.highrisk": "RISQUE �0LEV�0",
      "badge.notready": "PAS PR�`T",
      "readiness.excellent": "Excellente",
      "readiness.moderate": "Modérée",
      "readiness.low": "Faible",
      "readiness.excellentFull": "Solide préparation réglementaire sur toutes les zones critiques.",
      "readiness.moderateFull": "Bonne base avec plusieurs points exigeant une attention.",
      "readiness.lowFull": "Un travail de conformité important est requis avant le lancement.",
      "empty.topPending.doneTitle": "Tout est à jour",
      "empty.topPending.doneDesc": "Aucune exigence en attente pour le moment.",
      "empty.topPending.noneTitle": "Rien en attente pour l'instant",
      "empty.topPending.noneDesc": "Lancez une analyse pour générer votre file de priorités.",
      "empty.dashTl.doneTitle": "Plan en bonne voie",
      "empty.dashTl.doneDesc": "Votre plan d'action comporte des jalons actifs.",
      "empty.dashTl.noneTitle": "Pas encore de chronologie",
      "empty.dashTl.noneDesc": "Terminez une analyse pour construire votre calendrier de lancement.",
      "empty.watch.flagTitle": "Aucun changement signalé",
      "empty.watch.flagDesc": "Les règlements suivis sont stables.",
      "empty.watch.noneTitle": "Rien de suivi pour l'instant",
      "empty.watch.noneDesc": "Suivez des marchés pour surveiller les changements réglementaires.",
      "empty.gaps": "Aucun écart détecté.",
      "empty.actions.doneTitle": "Toutes les actions sont terminées",
      "empty.actions.doneDesc": "Chaque étape de remédiation est faite.",
      "empty.actions.noneTitle": "Pas encore d'actions",
      "empty.actions.noneDesc": "Les actions sont générées une fois l'analyse terminée.",
      "empty.costs.hasData": "Les coûts sont estimés à partir de vos éléments en attente et de votre profil de marché.",
      "empty.costs.none": "Lancez une analyse pour estimer votre budget de conformité.",
      "empty.updates.hasDataTitle": "Dernières mises à jour",
      "empty.updates.hasDataDesc": "Changements récents affectant vos marchés suivis.",
      "empty.updates.noneTitle": "Pas encore de mises à jour",
      "empty.updates.noneDesc": "Les mises à jour apparaissent lorsque les règlements suivis changent.",
      "update.fallback": "Mise à jour",
      "empty.impact.hasDataTitle": "Vue d'ensemble d'impact",
      "empty.impact.hasDataDesc": "Comment les changements réglementaires affectent votre activité.",
      "empty.impact.noneTitle": "Pas de données d'impact",
      "empty.impact.noneDesc": "Les analyses d'impact apparaissent après le suivi de règlements.",
      "docs.emptyTitle": "Pas encore de documents",
      "docs.emptyDesc": "Téléversez licences, certificats et fichiers de conformité pour tout centraliser.",
      "analyze.cta": "Analyser",
      "analyze.running": "Analyse en cours⬦",
      "analyze.complete": "Analyse terminée",
      "err.title": "L'analyse n'a pas pu être terminée",
      "err.stage": "�0tape",
      "err.reason": "Motif",
      "err.error": "Erreur",
      "err.action": "Action recommandée",
      "err.details": "Détails",
      "err.retryBtn": "Relancer l'analyse",
      "err.msg.SERVER_UNREACHABLE": "Impossible de joindre le serveur ReguLens. Vérifiez votre connexion et réessayez.",
      "err.msg.REQUEST_FAILED": "La requête a échoué de manière inattendue. Veuillez réessayer.",
      "err.msg.AI_NOT_CONFIGURED": "Le moteur d'IA n'est pas configuré sur ce serveur.",
      "err.msg.PROVIDER_AUTH_REJECTED": "Le fournisseur d'IA a rejeté les identifiants configurés sur ce serveur.",
      "err.msg.PROVIDER_MODEL_UNAVAILABLE": "Le modèle d'IA est temporairement indisponible. Réessayez bientôt.",
      "err.msg.RATE_LIMITED": "La limite de requêtes du fournisseur d'IA a été atteinte. Patientez puis réessayez.",
      "err.msg.PROVIDER_ERROR": "Le fournisseur d'IA a renvoyé une erreur inattendue.",
      "err.msg.PROVIDER_UNREACHABLE": "Impossible de joindre le réseau du fournisseur d'IA.",
      "err.msg.MALFORMED_RESPONSE": "L'IA a renvoyé une réponse impossible à analyser.",
      "err.msg.STAGE_FAILED": "Une des étapes de l'analyse a échoué.",
      "err.rec.PROVIDER_AUTH_REJECTED": "Vérifiez la clé API du fournisseur d'IA dans la configuration du serveur.",
      "err.rec.PROVIDER_MODEL_UNAVAILABLE": "Réessayez dans quelques minutes ou passez en Mode Démo.",
      "err.rec.RATE_LIMITED": "Attendez environ une minute, puis relancez l'analyse.",
      "err.rec.DEFAULT": "Relancez l'analyse. Si l'échec persiste, passez en Mode Démo.",
      "validate.company": "Veuillez saisir le nom de votre entreprise.",
      "validate.product": "Veuillez décrire votre produit ou service.",
      "validate.target": "Veuillez sélectionner un marché cible.",
      "validate.industry": "Veuillez sélectionner votre industrie.",
      "act.total": "Actions Totales",
      "act.critical": "Critiques",
      "act.completed": "Terminées",
      "act.daysReady": "Jours avant Prêt",
      "plan.total": "Total {d} jours (~{w} semaines)",
      "plan.criticalPath": "chemin critique : {p}",
      "plan.runToCompute": "Lancez une analyse pour calculer votre plan de lancement.",
      "plan.actions": "{n} actions",
      "plan.dayRange": "Jour {a}�{b}",
      "dd.target": "Sélectionnez un marché cible⬦",
      "dd.industry": "Sélectionnez une industrie⬦",
      "cmd.noMatch": "Aucune commande ne correspond à « {q} »",
      "industry.fintech": "FinTech",
      "industry.banking-financial": "Banque et Services Financiers",
      "industry.healthcare": "Santé",
      "industry.healthtech": "HealthTech",
      "industry.edtech": "EdTech",
      "industry.ecommerce": "Commerce en Ligne",
      "industry.saas": "SaaS",
      "industry.ai-ml": "IA et Apprentissage Automatique",
      "industry.manufacturing": "Fabrication",
      "industry.retail": "Commerce de Détail",
      "industry.food-beverage": "Aliments et Boissons",
      "industry.logistics": "Logistique et Chaîne d'Approvisionnement",
      "industry.energy": "�0nergie",
      "industry.automotive": "Automobile",
      "industry.telecommunications": "Télécommunications",
      "industry.insurance": "Assurance",
      "industry.pharmaceuticals": "Pharmaceutique",
      "industry.travel-tourism": "Voyages et Tourisme",
      "industry.general": "Général / Autre"
    },

    de: {
      "nav.dashboard": "Dashboard",
      "nav.canILaunch": "Kann ich Starten?",
      "nav.agentIntel": "Agenten-Intelligenz",
      "nav.requirements": "Anforderungen",
      "nav.gapAnalysis": "Lückenanalyse",
      "nav.actionPlan": "Ma�xnahmenplan",
      "nav.costEstimator": "Kostenschätzer",
      "nav.docLibrary": "Dokumentenbibliothek",
      "nav.regWatch": "Regulierungsbeobachtung",
      "nav.updates": "Aktualisierungen",
      "nav.impactAnalysis": "Impact-Analyse",
      "nav.group.analyze": "ANALYSIEREN",
      "nav.group.monitor": "\u00dcBERWACHEN",
      "help.title": "Hilfe ben\u00f6tigt?",
      "help.text": "Sprich mit unserem Compliance-Experten",
      "help.book": "Call buchen",
      "crumb.marketReadiness": "Marktreife",
      "crumb.settings": "Einstellungen",
      "crumb.profile": "Profil",
      "charts.empty": "Noch keine Daten zum Anzeigen.",
      "dashboard.totalRequirements": "Anforderungen Gesamt",
      "dashboard.riskLevel": "Risikostufe",
      "dashboard.estimatedDays": "Gesch\u00e4tzte Tage",
      "dashboard.complianceProgress": "Compliance-Fortschritt",
      "cost.total": "Gesamte Gesch\u00e4tzte Kosten",
      "gap.totalGaps": "Offene L\u00fccken",
      "gap.critical": "Kritisch",
      "gap.high": "Hoch",
      "gap.medium": "Mittel",
      "gap.low": "Niedrig",
      "req.statusCompleted": "Abgeschlossen",
      "req.statusInProgress": "In Bearbeitung",
      "req.statusPending": "Ausstehend",
      "req.statusNA": "k. A.",
      "sev.critical": "Kritisch",
      "sev.high": "Hoch",
      "sev.medium": "Mittel",
      "sev.low": "Niedrig",
      "sev.info": "Info",
      "prio.high": "Hohe Priorit\u00e4t",
      "prio.medium": "Mittlere Priorit\u00e4t",
      "prio.low": "Niedrige Priorit\u00e4t",
      "time.day": "Tag",
      "time.days": "Tage",
      "time.publishedOn": "Ver\u00f6ffentlicht am {d}",
      "time.more": "+{n} weitere⬦",
      "common.update": "Aktualisieren",
      "common.complete": "Vollst\u00e4ndig",
      "common.none": "Keine",
      "common.viewDetails": "Details anzeigen",
      "reg.label": "Verordnung",
      "reg.kind.new": "Neue Verordnung",
      "reg.kind.amendment": "\u00c4nderung",
      "reg.kind.update": "Aktualisierung",
      "reg.kind.repeal": "Aufhebung",
      "reg.kind.guidance": "Leitfaden",
      "stage.research": "Marktforschung",
      "stage.requirements": "Anforderungs-Mapping",
      "stage.gaps": "L\u00fcckenanalyse",
      "stage.risks": "Risikobewertung",
      "stage.actions": "Ma\u00dfnahmenplanung",
      "stage.readiness": "Marktreife-Bewertung",
      "agent.name.research": "Recherche-Agent",
      "agent.name.requirements": "Anforderungs-Agent",
      "agent.name.gaps": "L\u00fccken-Agent",
      "agent.name.risk": "Risiko-Agent",
      "agent.name.actions": "Ma\u00dfnahmen-Agent",
      "agent.purpose.research": "Identifiziert Verordnungen, die f\u00fcr dein Produkt gelten k\u00f6nnten",
      "agent.purpose.requirements": "Wandelt Verordnungen in konkrete Compliance-Anforderungen um",
      "agent.purpose.gaps": "Findet, was zwischen dir und der Compliance fehlt",
      "agent.purpose.risk": "Bewertet Startrisiko und gesch\u00e4ftliche Auswirkungen",
      "agent.purpose.actions": "Erstellt einen priorisierten Sanierungsplan",
      "ai.byPriority": "Anforderungen nach Priorit\u00e4t",
      "ai.bySeverity": "L\u00fccken nach Schweregrad",
      "ai.countReqs": "{n} Anforderungen",
      "ai.countGaps": "{n} L\u00fccken",
      "ai.more": "+{n} weitere⬦",
      "ai.sum.research": "{n} potenziell anwendbare regulatorische Quellen identifiziert{extra}.",
      "ai.sum.reqs": "{n} Compliance-Anforderungen generiert{extra}.",
      "ai.sum.gaps": "{n} Compliance-L\u00fccken gefunden{extra}.",
      "ai.sum.readiness": "Marktreife-Score: {p}%{extra}",
      "ai.sum.readinessPlain": "Marktreife-Score berechnet.",
      "ai.sum.actions": "{n} priorisierte Sanierungsma\u00dfnahmen erstellt{extra}.",
      "ai.extra.highConf": " ({h} hohe Konfidenz)",
      "ai.extra.critical": " ({h} kritisch)",
      "ai.extra.highPrio": " ({h} hohe Priorit\u00e4t)",
      "ai.extra.risk": " \u00b7 Risikostufe: {r}",
      "ai.extra.cost": " \u00b7 Gesch. Kosten: {c}",
      "verdict.noAnalysis": "F\u00fchre eine Analyse aus, um dein Start-Urteil zu erhalten.",
      "verdict.prompt": "Gib deine Unternehmens- und Produktdaten ein, um zu sehen, ob du startbereit bist.",
      "verdict.ready": "{c} ist zu {p}% bereit, {pr} in {m} zu starten.",
      "verdict.pendingLeft": "Behebe die verbleibenden {n} ausstehenden Anforderungen vor dem Markteintritt, um regulatorisches Risiko zu senken.",
      "verdict.allDone": "Alle Anforderungen sind erledigt \u2014 du kannst fortfahren.",
      "badge.ready": "STARTBEREIT",
      "badge.conditions": "BEDINGTES GO",
      "badge.highrisk": "HOHES RISIKO",
      "badge.notready": "NICHT BEREIT",
      "readiness.excellent": "Ausgezeichnet",
      "readiness.moderate": "Moderat",
      "readiness.low": "Niedrig",
      "readiness.excellentFull": "Starke regulatorische Bereitschaft in allen kritischen Bereichen.",
      "readiness.moderateFull": "Gute Basis mit mehreren Bereichen, die Aufmerksamkeit ben\u00f6tigen.",
      "readiness.lowFull": "Erheblicher Compliance-Aufwand ist vor dem Start erforderlich.",
      "empty.topPending.doneTitle": "Alles erledigt",
      "empty.topPending.doneDesc": "Derzeit keine ausstehenden Anforderungen.",
      "empty.topPending.noneTitle": "Noch nichts ausstehend",
      "empty.topPending.noneDesc": "F\u00fchre eine Analyse aus, um deine Priorit\u00e4tenliste zu erstellen.",
      "empty.dashTl.doneTitle": "Plan auf Kurs",
      "empty.dashTl.doneDesc": "Dein Ma\u00dfnahmenplan hat aktive Meilensteine.",
      "empty.dashTl.noneTitle": "Noch keine Zeitleiste",
      "empty.dashTl.noneDesc": "Schlie\u00dfe eine Analyse ab, um deinen Start-Zeitplan zu erstellen.",
      "empty.watch.flagTitle": "Keine markierten \u00c4nderungen",
      "empty.watch.flagDesc": "Beobachtete Verordnungen sind stabil.",
      "empty.watch.noneTitle": "Noch nichts beobachtet",
      "empty.watch.noneDesc": "Beobachte M\u00e4rkte, um regulatorische \u00c4nderungen zu verfolgen.",
      "empty.gaps": "Keine L\u00fccken festgestellt.",
      "empty.actions.doneTitle": "Alle Ma\u00dfnahmen abgeschlossen",
      "empty.actions.doneDesc": "Jeder Sanierungsschritt ist erledigt.",
      "empty.actions.noneTitle": "Noch keine Ma\u00dfnahmen",
      "empty.actions.noneDesc": "Ma\u00dfnahmen werden nach Abschluss einer Analyse erstellt.",
      "empty.costs.hasData": "Kosten werden aus offenen Posten und deinem Marktprofil gesch\u00e4tzt.",
      "empty.costs.none": "F\u00fchre eine Analyse aus, um dein Compliance-Budget zu sch\u00e4tzen.",
      "empty.updates.hasDataTitle": "Neueste Aktualisierungen",
      "empty.updates.hasDataDesc": "Aktuelle \u00c4nderungen, die deine beobachteten M\u00e4rkte betreffen.",
      "empty.updates.noneTitle": "Noch keine Aktualisierungen",
      "empty.updates.noneDesc": "Aktualisierungen erscheinen, wenn sich beobachtete Verordnungen \u00e4ndern.",
      "update.fallback": "Aktualisierung",
      "empty.impact.hasDataTitle": "Impact-\u00dcbersicht",
      "empty.impact.hasDataDesc": "Wie sich regulatorische \u00c4nderungen auf dein Gesch\u00e4ft auswirken.",
      "empty.impact.noneTitle": "Keine Impact-Daten",
      "empty.impact.noneDesc": "Impact-Einblicke erscheinen nach dem Beobachten von Verordnungen.",
      "docs.emptyTitle": "Noch keine Dokumente",
      "docs.emptyDesc": "Lade Lizenzen, Zertifikate und Compliance-Dateien hoch, um alles an einem Ort zu haben.",
      "analyze.cta": "Analysieren",
      "analyze.running": "Analysiere⬦",
      "analyze.complete": "Analyse abgeschlossen",
      "err.title": "Analyse konnte nicht abgeschlossen werden",
      "err.stage": "Phase",
      "err.reason": "Ursache",
      "err.error": "Fehler",
      "err.action": "Empfohlene Ma\u00dfnahme",
      "err.details": "Details",
      "err.retryBtn": "Analyse Wiederholen",
      "err.msg.SERVER_UNREACHABLE": "ReguLens-Server nicht erreichbar. Pr\u00fcfe deine Verbindung und versuche es erneut.",
      "err.msg.REQUEST_FAILED": "Die Anfrage ist unerwartet fehlgeschlagen. Bitte erneut versuchen.",
      "err.msg.AI_NOT_CONFIGURED": "Die KI-Engine ist auf diesem Server nicht konfiguriert.",
      "err.msg.PROVIDER_AUTH_REJECTED": "Der KI-Anbieter hat die auf diesem Server konfigurierten Zugangsdaten abgelehnt.",
      "err.msg.PROVIDER_MODEL_UNAVAILABLE": "Das KI-Modell ist vor\u00fcbergehend nicht verf\u00fcgbar. Bitte bald erneut versuchen.",
      "err.msg.RATE_LIMITED": "Das Rate-Limit des KI-Anbieters wurde erreicht. Warte kurz und versuche es erneut.",
      "err.msg.PROVIDER_ERROR": "Der KI-Anbieter hat einen unerwarteten Fehler zur\u00fcckgegeben.",
      "err.msg.PROVIDER_UNREACHABLE": "Das Netzwerk des KI-Anbieters war nicht erreichbar.",
      "err.msg.MALFORMED_RESPONSE": "Die KI lieferte eine nicht auswertbare Antwort.",
      "err.msg.STAGE_FAILED": "Eine der Analysephasen ist fehlgeschlagen.",
      "err.rec.PROVIDER_AUTH_REJECTED": "\u00dcberpr\u00fcfe den API-Key des KI-Anbieters in der Serverkonfiguration.",
      "err.rec.PROVIDER_MODEL_UNAVAILABLE": "Versuche es in ein paar Minuten erneut oder wechsle in den Demo-Modus.",
      "err.rec.RATE_LIMITED": "Warte etwa eine Minute und dr\u00fccke dann auf Analyse Wiederholen.",
      "err.rec.DEFAULT": "Dr\u00fccke auf Analyse Wiederholen. Falls es weiter fehlschl\u00e4gt, wechsle in den Demo-Modus.",
      "validate.company": "Bitte gib deinen Firmennamen ein.",
      "validate.product": "Bitte beschreibe dein Produkt oder deine Dienstleistung.",
      "validate.target": "Bitte w\u00e4hle einen Zielmarkt.",
      "validate.industry": "Bitte w\u00e4hle deine Branche.",
      "act.total": "Ma\u00dfnahmen Gesamt",
      "act.critical": "Kritisch",
      "act.completed": "Abgeschlossen",
      "act.daysReady": "Tage bis Startbereit",
      "plan.total": "Gesamt {d} Tage (~{w} Wochen)",
      "plan.criticalPath": "kritischer Pfad: {p}",
      "plan.runToCompute": "F\u00fchre eine Analyse aus, um deinen Startplan zu berechnen.",
      "plan.actions": "{n} Ma\u00dfnahmen",
      "plan.dayRange": "Tag {a}\u2013{b}",
      "dd.target": "Zielmarkt w\u00e4hlen⬦",
      "dd.industry": "Branche w\u00e4hlen⬦",
      "cmd.noMatch": "Keine Befehle passen zu \u201e{q}\u201c",
      "industry.fintech": "FinTech",
      "industry.banking-financial": "Banken & Finanzdienstleistungen",
      "industry.healthcare": "Gesundheitswesen",
      "industry.healthtech": "HealthTech",
      "industry.edtech": "EdTech",
      "industry.ecommerce": "E-Commerce",
      "industry.saas": "SaaS",
      "industry.ai-ml": "KI & Machine Learning",
      "industry.manufacturing": "Fertigung",
      "industry.retail": "Einzelhandel",
      "industry.food-beverage": "Lebensmittel & Getr\u00e4nke",
      "industry.logistics": "Logistik & Lieferkette",
      "industry.energy": "Energie",
      "industry.automotive": "Automotive",
      "industry.telecommunications": "Telekommunikation",
      "industry.insurance": "Versicherung",
      "industry.pharmaceuticals": "Pharma",
      "industry.travel-tourism": "Reisen & Tourismus",
      "industry.general": "Allgemein / Sonstiges"
    },

    pt: {
      "nav.dashboard": "Painel",
      "nav.canILaunch": "Posso Lan\u00e7ar?",
      "nav.agentIntel": "Intelig\u00eancia de Agentes",
      "nav.requirements": "Requisitos",
      "nav.gapAnalysis": "An\u00e1lise de Lacunas",
      "nav.actionPlan": "Plano de A\u00e7\u00e3o",
      "nav.costEstimator": "Estimador de Custos",
      "nav.docLibrary": "Biblioteca de Documentos",
      "nav.regWatch": "Vigil\u00e2ncia Regulat\u00f3ria",
      "nav.updates": "Atualiza\u00e7\u00f5es",
      "nav.impactAnalysis": "An\u00e1lise de Impacto",
      "nav.group.analyze": "ANALISAR",
      "nav.group.monitor": "MONITORAR",
      "help.title": "Precisa de ajuda?",
      "help.text": "Fale com nosso especialista em conformidade",
      "help.book": "Agendar uma chamada",
      "crumb.marketReadiness": "Prepara\u00e7\u00e3o para o Mercado",
      "crumb.settings": "Configura\u00e7\u00f5es",
      "crumb.profile": "Perfil",
      "charts.empty": "Ainda n\u00e3o h\u00e1 dados para exibir.",
      "dashboard.totalRequirements": "Total de Requisitos",
      "dashboard.riskLevel": "N\u00edvel de Risco",
      "dashboard.estimatedDays": "Dias Estimados",
      "dashboard.complianceProgress": "Progresso de Conformidade",
      "cost.total": "Custo Total Estimado",
      "gap.totalGaps": "Lacunas Abertas",
      "gap.critical": "Cr\u00edticas",
      "gap.high": "Altas",
      "gap.medium": "M\u00e9dias",
      "gap.low": "Baixas",
      "req.statusCompleted": "Conclu\u00eddo",
      "req.statusInProgress": "Em Andamento",
      "req.statusPending": "Pendente",
      "req.statusNA": "N/D",
      "sev.critical": "Cr\u00edtica",
      "sev.high": "Alta",
      "sev.medium": "M\u00e9dia",
      "sev.low": "Baixa",
      "sev.info": "Informa\u00e7\u00e3o",
      "prio.high": "Prioridade Alta",
      "prio.medium": "Prioridade M\u00e9dia",
      "prio.low": "Prioridade Baixa",
      "time.day": "dia",
      "time.days": "dias",
      "time.publishedOn": "Publicado em {d}",
      "time.more": "+{n} mais⬦",
      "common.update": "Atualizar",
      "common.complete": "Completo",
      "common.none": "Nenhum",
      "common.viewDetails": "Ver detalhes",
      "reg.label": "Regulamenta\u00e7\u00e3o",
      "reg.kind.new": "Nova Regulamenta\u00e7\u00e3o",
      "reg.kind.amendment": "Emenda",
      "reg.kind.update": "Atualiza\u00e7\u00e3o",
      "reg.kind.repeal": "Revoga\u00e7\u00e3o",
      "reg.kind.guidance": "Orienta\u00e7\u00e3o",
      "stage.research": "Pesquisa de Mercado",
      "stage.requirements": "Mapeamento de Requisitos",
      "stage.gaps": "An\u00e1lise de Lacunas",
      "stage.risks": "Avalia\u00e7\u00e3o de Riscos",
      "stage.actions": "Planejamento de A\u00e7\u00f5es",
      "stage.readiness": "Pontua\u00e7\u00e3o de Prontid\u00e3o",
      "agent.name.research": "Agente de Pesquisa",
      "agent.name.requirements": "Agente de Requisitos",
      "agent.name.gaps": "Agente de Lacunas",
      "agent.name.risk": "Agente de Riscos",
      "agent.name.actions": "Agente de A\u00e7\u00f5es",
      "agent.purpose.research": "Identifica regulamenta\u00e7\u00f5es que podem se aplicar ao seu produto",
      "agent.purpose.requirements": "Converte regulamenta\u00e7\u00f5es em requisitos de conformidade concretos",
      "agent.purpose.gaps": "Encontra o que falta entre voc\u00ea e a conformidade",
      "agent.purpose.risk": "Avalia o risco de lan\u00e7amento e o impacto no neg\u00f3cio",
      "agent.purpose.actions": "Constr\u00f3i um plano de remedia\u00e7\u00e3o priorizado",
      "ai.byPriority": "Requisitos por Prioridade",
      "ai.bySeverity": "Lacunas por Severidade",
      "ai.countReqs": "{n} requisitos",
      "ai.countGaps": "{n} lacunas",
      "ai.more": "+{n} mais⬦",
      "ai.sum.research": "{n} fontes regulat\u00f3rias potencialmente aplic\u00e1veis identificadas{extra}.",
      "ai.sum.reqs": "{n} requisitos de conformidade gerados{extra}.",
      "ai.sum.gaps": "{n} lacunas de conformidade encontradas{extra}.",
      "ai.sum.readiness": "Pontua\u00e7\u00e3o de prontid\u00e3o: {p}%{extra}",
      "ai.sum.readinessPlain": "Pontua\u00e7\u00e3o de prontid\u00e3o para o mercado calculada.",
      "ai.sum.actions": "{n} a\u00e7\u00f5es de remedia\u00e7\u00e3o priorizadas geradas{extra}.",
      "ai.extra.highConf": " ({h} alta confian\u00e7a)",
      "ai.extra.critical": " ({h} cr\u00edticas)",
      "ai.extra.highPrio": " ({h} alta prioridade)",
      "ai.extra.risk": " \u00b7 N\u00edvel de risco: {r}",
      "ai.extra.cost": " \u00b7 Custo estimado: {c}",
      "verdict.noAnalysis": "Execute uma an\u00e1lise para obter seu veredito de lan\u00e7amento.",
      "verdict.prompt": "Insira os dados da sua empresa e produto para saber se voc\u00ea est\u00e1 pronto para lan\u00e7ar.",
      "verdict.ready": "{c} est\u00e1 {p}% pronto para lan\u00e7ar {pr} em {m}.",
      "verdict.pendingLeft": "Resolva os {n} requisitos pendentes antes de entrar no mercado para reduzir o risco regulat\u00f3rio.",
      "verdict.allDone": "Todos os requisitos foram atendidos \u2014 voc\u00ea pode prosseguir.",
      "badge.ready": "PRONTO PARA LAN\u00c7AR",
      "badge.conditions": "GO CONDICIONAL",
      "badge.highrisk": "ALTO RISCO",
      "badge.notready": "N\u00c3O PRONTO",
      "readiness.excellent": "Excelente",
      "readiness.moderate": "Moderada",
      "readiness.low": "Baixa",
      "readiness.excellentFull": "Forte prepara\u00e7\u00e3o regulat\u00f3ria em todas as \u00e1reas cr\u00edticas.",
      "readiness.moderateFull": "Boa base com v\u00e1rias \u00e1reas exigindo aten\u00e7\u00e3o.",
      "readiness.lowFull": "Trabalho significativo de conformidade \u00e9 necess\u00e1rio antes do lan\u00e7amento.",
      "empty.topPending.doneTitle": "Tudo em dia",
      "empty.topPending.doneDesc": "N\u00e3o h\u00e1 requisitos pendentes no momento.",
      "empty.topPending.noneTitle": "Nada pendente ainda",
      "empty.topPending.noneDesc": "Execute uma an\u00e1lise para gerar sua fila de prioridades.",
      "empty.dashTl.doneTitle": "Plano nos trilhos",
      "empty.dashTl.doneDesc": "Seu plano de a\u00e7\u00e3o tem marcos ativos.",
      "empty.dashTl.noneTitle": "Ainda sem cronograma",
      "empty.dashTl.noneDesc": "Conclua uma an\u00e1lise para construir seu cronograma de lan\u00e7amento.",
      "empty.watch.flagTitle": "Nenhuma altera\u00e7\u00e3o sinalizada",
      "empty.watch.flagDesc": "As regulamenta\u00e7\u00f5es acompanhadas est\u00e3o est\u00e1veis.",
      "empty.watch.noneTitle": "Nada sendo acompanhado ainda",
      "empty.watch.noneDesc": "Acompanhe mercados para monitorar mudan\u00e7as regulat\u00f3rias.",
      "empty.gaps": "Nenhuma lacuna detectada.",
      "empty.actions.doneTitle": "Todas as a\u00e7\u00f5es conclu\u00eddas",
      "empty.actions.doneDesc": "Cada etapa de remedia\u00e7\u00e3o foi conclu\u00edda.",
      "empty.actions.noneTitle": "Ainda sem a\u00e7\u00f5es",
      "empty.actions.noneDesc": "As a\u00e7\u00f5es s\u00e3o geradas ap\u00f3s a conclus\u00e3o de uma an\u00e1lise.",
      "empty.costs.hasData": "Os custos s\u00e3o estimados a partir dos seus itens pendentes e perfil de mercado.",
      "empty.costs.none": "Execute uma an\u00e1lise para estimar seu or\u00e7amento de conformidade.",
      "empty.updates.hasDataTitle": "\u00daltimas atualiza\u00e7\u00f5es",
      "empty.updates.hasDataDesc": "Mudan\u00e7as recentes afetando seus mercados acompanhados.",
      "empty.updates.noneTitle": "Ainda sem atualiza\u00e7\u00f5es",
      "empty.updates.noneDesc": "Atualiza\u00e7\u00f5es aparecem quando regulamenta\u00e7\u00f5es acompanhadas mudam.",
      "update.fallback": "Atualiza\u00e7\u00e3o",
      "empty.impact.hasDataTitle": "Vis\u00e3o geral de impacto",
      "empty.impact.hasDataDesc": "Como as mudan\u00e7as regulat\u00f3rias afetam seu neg\u00f3cio.",
      "empty.impact.noneTitle": "Sem dados de impacto",
      "empty.impact.noneDesc": "Insights de impacto aparecem ap\u00f3s acompanhar regulamenta\u00e7\u00f5es.",
      "docs.emptyTitle": "Ainda sem documentos",
      "docs.emptyDesc": "Envie licen\u00e7as, certificados e arquivos de conformidade para tê-los em um s\u00f3 lugar.",
      "analyze.cta": "Analisar",
      "analyze.running": "Analisando⬦",
      "analyze.complete": "An\u00e1lise conclu\u00edda",
      "err.title": "A an\u00e1lise n\u00e3o p\u00f4de ser conclu\u00edda",
      "err.stage": "Etapa",
      "err.reason": "Motivo",
      "err.error": "Erro",
      "err.action": "A\u00e7\u00e3o recomendada",
      "err.details": "Detalhes",
      "err.retryBtn": "Repetir An\u00e1lise",
      "err.msg.SERVER_UNREACHABLE": "N\u00e3o foi poss\u00edvel conectar ao servidor ReguLens. Verifique sua conex\u00e3o e tente novamente.",
      "err.msg.REQUEST_FAILED": "A solicita\u00e7\u00e3o falhou inesperadamente. Tente novamente.",
      "err.msg.AI_NOT_CONFIGURED": "O motor de IA n\u00e3o est\u00e1 configurado neste servidor.",
      "err.msg.PROVIDER_AUTH_REJECTED": "O provedor de IA rejeitou as credenciais configuradas neste servidor.",
      "err.msg.PROVIDER_MODEL_UNAVAILABLE": "O modelo de IA est\u00e1 temporariamente indispon\u00edvel. Tente novamente em breve.",
      "err.msg.RATE_LIMITED": "O limite de solicita\u00e7\u00f5es do provedor de IA foi atingido. Aguarde um momento e tente novamente.",
      "err.msg.PROVIDER_ERROR": "O provedor de IA retornou um erro inesperado.",
      "err.msg.PROVIDER_UNREACHABLE": "N\u00e3o foi poss\u00edvel alcan\u00e7ar a rede do provedor de IA.",
      "err.msg.MALFORMED_RESPONSE": "A IA retornou uma resposta que n\u00e3o p\u00f4de ser processada.",
      "err.msg.STAGE_FAILED": "Uma das etapas da an\u00e1lise falhou.",
      "err.rec.PROVIDER_AUTH_REJECTED": "Verifique a chave de API do provedor de IA na configura\u00e7\u00e3o do servidor.",
      "err.rec.PROVIDER_MODEL_UNAVAILABLE": "Tente novamente em alguns minutos ou mude para o Modo Demo.",
      "err.rec.RATE_LIMITED": "Espere cerca de um minuto e pressione Repetir An\u00e1lise.",
      "err.rec.DEFAULT": "Pressione Repetir An\u00e1lise. Se continuar falhando, mude para o Modo Demo.",
      "validate.company": "Informe o nome da sua empresa.",
      "validate.product": "Descreva seu produto ou servi\u00e7o.",
      "validate.target": "Selecione um mercado-alvo.",
      "validate.industry": "Selecione sua ind\u00fastria.",
      "act.total": "A\u00e7\u00f5es Totais",
      "act.critical": "Cr\u00edticas",
      "act.completed": "Conclu\u00eddas",
      "act.daysReady": "Dias at\u00e9 Pronto",
      "plan.total": "Total de {d} dias (~{w} semanas)",
      "plan.criticalPath": "caminho cr\u00edtico: {p}",
      "plan.runToCompute": "Execute uma an\u00e1lise para calcular seu plano de lan\u00e7amento.",
      "plan.actions": "{n} a\u00e7\u00f5es",
      "plan.dayRange": "Dia {a}\u2013{b}",
      "dd.target": "Selecione o mercado-alvo⬦",
      "dd.industry": "Selecione a ind\u00fastria⬦",
      "cmd.noMatch": "Nenhum comando corresponde a \u201c{q}\u201d",
      "industry.fintech": "FinTech",
      "industry.banking-financial": "Banca e Servi\u00e7os Financeiros",
      "industry.healthcare": "Sa\u00fade",
      "industry.healthtech": "HealthTech",
      "industry.edtech": "EdTech",
      "industry.ecommerce": "Com\u00e9rcio Eletr\u00f4nico",
      "industry.saas": "SaaS",
      "industry.ai-ml": "IA e Aprendizado de M\u00e1quina",
      "industry.manufacturing": "Manufatura",
      "industry.retail": "Varejo",
      "industry.food-beverage": "Alimentos e Bebidas",
      "industry.logistics": "Log\u00edstica e Cadeia de Suprimentos",
      "industry.energy": "Energia",
      "industry.automotive": "Automotiva",
      "industry.telecommunications": "Telecomunica\u00e7\u00f5es",
      "industry.insurance": "Seguros",
      "industry.pharmaceuticals": "Farmac\u00eautica",
      "industry.travel-tourism": "Viagens e Turismo",
      "industry.general": "Geral / Outro"
    },

    ru: {
      "nav.dashboard": "�xанел�R ђпѬавления",
      "nav.canILaunch": "�Sогђ ли я запђс�и��Rся?",
      "nav.agentIntel": "��н�еллек� аген�ов",
      "nav.requirements": "ТѬебования",
      "nav.gapAnalysis": "Анализ пѬобелов",
      "nav.actionPlan": "�xлан дейс�вий",
      "nav.costEstimator": "�aал�Rкђля�оѬ за�Ѭа�",
      "nav.docLibrary": "�иблио�ека докђмен�ов",
      "nav.regWatch": "Регђля�оѬн�9й мони�оѬинг",
      "nav.updates": "�~бновления",
      "nav.impactAnalysis": "Анализ воздейс�вия",
      "nav.group.analyze": "АНА�:���",
      "nav.group.monitor": "�S�~Н��Т�~Р��Н�",
      "help.title": "Нђжна помо�0�R?",
      "help.text": "�xоговоѬи�е с на��им экспеѬ�ом по комплаенсђ",
      "help.book": "�аписа��Rся на звонок",
      "crumb.marketReadiness": "�о�овнос��R к Ѭ�9нкђ",
      "crumb.settings": "Нас�Ѭойки",
      "crumb.profile": "�xѬо�ил�R",
      "charts.empty": "�анн�9�& для о�обѬажения пока не�.",
      "dashboard.totalRequirements": "�сего �Ѭебований",
      "dashboard.riskLevel": "УѬовен�R Ѭиска",
      "dashboard.estimatedDays": "Рас�!��н�9е дни",
      "dashboard.complianceProgress": "�xѬогѬесс соо�ве�с�вия",
      "cost.total": "�~б�0ая Ѭас�!��ная с�оимос��R",
      "gap.totalGaps": "�~�кѬ�9��9е пѬобел�9",
      "gap.critical": "�aѬи�и�!еские",
      "gap.high": "��9сокие",
      "gap.medium": "СѬедние",
      "gap.low": "Низкие",
      "req.statusCompleted": "�авеѬ��ено",
      "req.statusInProgress": "� Ѭабо�е",
      "req.statusPending": "�~жидае�",
      "req.statusNA": "н/д",
      "sev.critical": "�aѬи�и�!еская",
      "sev.high": "��9сокая",
      "sev.medium": "СѬедняя",
      "sev.low": "Низкая",
      "sev.info": "��н�оѬма� ия",
      "prio.high": "��9сокий пѬиоѬи�е�",
      "prio.medium": "СѬедний пѬиоѬи�е�",
      "prio.low": "Низкий пѬиоѬи�е�",
      "time.day": "ден�R",
      "time.days": "дней",
      "time.publishedOn": "�~пђбликовано {d}",
      "time.more": "+е�0� {n}⬦",
      "common.update": "�~бнови��R",
      "common.complete": "�xолнос��R�}",
      "common.none": "Не�",
      "common.viewDetails": "�xодѬобнее",
      "reg.label": "Регламен�",
      "reg.kind.new": "Нов�9й Ѭегламен�",
      "reg.kind.amendment": "�xопѬавка",
      "reg.kind.update": "�~бновление",
      "reg.kind.repeal": "�~�мена",
      "reg.kind.guidance": "Рђководс�во",
      "stage.research": "��сследование Ѭ�9нка",
      "stage.requirements": "�aаѬ�иѬование �Ѭебований",
      "stage.gaps": "Анализ пѬобелов",
      "stage.risks": "�~� енка Ѭисков",
      "stage.actions": "�xланиѬование дейс�вий",
      "stage.readiness": "�~� енка го�овнос�и",
      "agent.name.research": "Аген�-исследова�ел�R",
      "agent.name.requirements": "Аген� �Ѭебований",
      "agent.name.gaps": "Аген� пѬобелов",
      "agent.name.risk": "Аген� Ѭисков",
      "agent.name.actions": "Аген� дейс�вий",
      "agent.purpose.research": "�~пѬеделяе� Ѭегламен��9, ко�оѬ�9е могђ� пѬименя��Rся к ва��емђ пѬодђк�ђ",
      "agent.purpose.requirements": "�xѬеобѬазђе� Ѭегламен��9 в конкѬе�н�9е �Ѭебования соо�ве�с�вия",
      "agent.purpose.gaps": "На�&оди�, �!его не �&ва�ае� междђ вами и соо�ве�с�вием",
      "agent.purpose.risk": "�~� енивае� Ѭиск запђска и влияние на бизнес",
      "agent.purpose.actions": "С�Ѭои� пѬиоѬи�изиѬованн�9й план ђс�Ѭанения",
      "ai.byPriority": "ТѬебования по пѬиоѬи�е�ђ",
      "ai.bySeverity": "�xѬобел�9 по сеѬ�R�знос�и",
      "ai.countReqs": "�Ѭебований: {n}",
      "ai.countGaps": "пѬобелов: {n}",
      "ai.more": "+е�0� {n}⬦",
      "ai.sum.research": "��9явлено {n} по�ен� иал�Rно пѬименим�9�& Ѭегђля�оѬн�9�& ис�о�!ников{extra}.",
      "ai.sum.reqs": "С�оѬмиѬовано {n} �Ѭебований соо�ве�с�вия{extra}.",
      "ai.sum.gaps": "Найдено {n} пѬобелов соо�ве�с�вия{extra}.",
      "ai.sum.readiness": "�~� енка го�овнос�и: {p}%{extra}",
      "ai.sum.readinessPlain": "Расс�!и�ана о� енка го�овнос�и к Ѭ�9нкђ.",
      "ai.sum.actions": "С�оѬмиѬовано {n} пѬиоѬи�изиѬованн�9�& дейс�вий по ђс�Ѭанени�}{extra}.",
      "ai.extra.highConf": " ({h} с в�9сокой ђвеѬеннос��R�})",
      "ai.extra.critical": " ({h} кѬи�и�!ески�&)",
      "ai.extra.highPrio": " ({h} в�9сокопѬиоѬи�е�н�9�&)",
      "ai.extra.risk": " · УѬовен�R Ѭиска: {r}",
      "ai.extra.cost": " · �~� енка за�Ѭа�: {c}",
      "verdict.noAnalysis": "�апђс�и�е анализ, �!�об�9 полђ�!и��R веѬдик� о запђске.",
      "verdict.prompt": "�веди�е данн�9е компании и пѬодђк�а, �!�об�9 ђзна��R, го�ов�9 ли в�9 к запђскђ.",
      "verdict.ready": "{c} го�ов(а) на {p}% запђс�и��R {pr} на Ѭ�9нке {m}.",
      "verdict.pendingLeft": "Ус�Ѭани�е ос�ав��иеся {n} ожида�}�0и�& �Ѭебований пеѬед в�9�&одом на Ѭ�9нок, �!�об�9 снизи��R Ѭегђля�оѬн�9й Ѭиск.",
      "verdict.allDone": "�се �Ѭебования в�9полнен�9 � в�9 го�ов�9 пѬодолжа��R.",
      "badge.ready": "��~Т�~� �a �А�xУС�aУ",
      "badge.conditions": "УС�:�~�НЫ�\" ��~�xУС�a",
      "badge.highrisk": "�ЫС�~�a���\" Р��С�a",
      "badge.notready": "Н�\" ��~Т�~�",
      "readiness.excellent": "�~�ли�!ная",
      "readiness.moderate": "УмеѬенная",
      "readiness.low": "Низкая",
      "readiness.excellentFull": "Сил�Rная Ѭегђля�оѬная го�овнос��R по всем кѬи�и�!еским напѬавлениям.",
      "readiness.moderateFull": "ХоѬо��ая база с нескол�Rкими зонами, �Ѭебђ�}�0ими внимания.",
      "readiness.lowFull": "�xеѬед запђском необ�&одима зна�!и�ел�Rная комплаенс-Ѭабо�а.",
      "empty.topPending.doneTitle": "�с� в поѬядке",
      "empty.topPending.doneDesc": "�~жида�}�0и�& �Ѭебований сей�!ас не�.",
      "empty.topPending.noneTitle": "�xока ни�!его не ожидае�",
      "empty.topPending.noneDesc": "�апђс�и�е анализ, �!�об�9 с�оѬмиѬова��R о�!еѬед�R пѬиоѬи�е�ов.",
      "empty.dashTl.doneTitle": "�xлан ид�� по гѬа�икђ",
      "empty.dashTl.doneDesc": "� ва��ем плане дейс�вий ес��R ак�ивн�9е ве�&и.",
      "empty.dashTl.noneTitle": "ХѬонологии пока не�",
      "empty.dashTl.noneDesc": "�авеѬ��и�е анализ, �!�об�9 пос�Ѭои��R гѬа�ик запђска.",
      "empty.watch.flagTitle": "�xоме�!енн�9�& изменений не�",
      "empty.watch.flagDesc": "�~�слеживаем�9е Ѭегламен��9 с�абил�Rн�9.",
      "empty.watch.noneTitle": "�xока ни�!его не о�слеживае�ся",
      "empty.watch.noneDesc": "�обав�R�е Ѭ�9нки, �!�об�9 следи��R за Ѭегђля�оѬн�9ми изменениями.",
      "empty.gaps": "�xѬобел�9 не обнаѬђжен�9.",
      "empty.actions.doneTitle": "�се дейс�вия в�9полнен�9",
      "empty.actions.doneDesc": "�aажд�9й ��аг ђс�Ѭанения завеѬ���н.",
      "empty.actions.noneTitle": "�ейс�вий пока не�",
      "empty.actions.noneDesc": "�ейс�вия �оѬмиѬђ�}�ся после завеѬ��ения анализа.",
      "empty.costs.hasData": "�а�Ѭа��9 о� енива�}�ся по ва��им о�кѬ�9��9м пђнк�ам и пѬо�ил�} Ѭ�9нка.",
      "empty.costs.none": "�апђс�и�е анализ, �!�об�9 о� ени��R комплаенс-б�}дже�.",
      "empty.updates.hasDataTitle": "�xоследние обновления",
      "empty.updates.hasDataDesc": "Недавние изменения, за�Ѭагива�}�0ие ва��и Ѭ�9нки.",
      "empty.updates.noneTitle": "�~бновлений пока не�",
      "empty.updates.noneDesc": "�~бновления появля�}�ся пѬи изменении о�слеживаем�9�& Ѭегламен�ов.",
      "update.fallback": "�~бновление",
      "empty.impact.hasDataTitle": "�~бзоѬ воздейс�вия",
      "empty.impact.hasDataDesc": "�aак Ѭегђля�оѬн�9е изменения влия�}� на ва�� бизнес.",
      "empty.impact.noneTitle": "Не� данн�9�& о воздейс�вии",
      "empty.impact.noneDesc": "Анали�ика воздейс�вия появи�ся после о�слеживания Ѭегламен�ов.",
      "docs.emptyTitle": "�окђмен�ов пока не�",
      "docs.emptyDesc": "�агѬђзи�е ли� ензии, сеѬ�и�ика��9 и �айл�9 соо�ве�с�вия, �!�об�9 деѬжа��R вс� в одном мес�е.",
      "analyze.cta": "АнализиѬова��R",
      "analyze.running": "Анализ⬦",
      "analyze.complete": "Анализ завеѬ���н",
      "err.title": "Не ђдалос�R завеѬ��и��R анализ",
      "err.stage": "Э�ап",
      "err.reason": "�xѬи�!ина",
      "err.error": "�~��ибка",
      "err.action": "Рекомендђемое дейс�вие",
      "err.details": "�е�али",
      "err.retryBtn": "�xов�оѬи��R анализ",
      "err.msg.SERVER_UNREACHABLE": "СеѬвеѬ ReguLens недос�ђпен. �xѬовеѬ�R�е соединение и попѬобђй�е снова.",
      "err.msg.REQUEST_FAILED": "�апѬос неожиданно завеѬ��ился о��ибкой. �xопѬобђй�е е�0� Ѭаз.",
      "err.msg.AI_NOT_CONFIGURED": "����-движок не нас�Ѭоен на э�ом сеѬвеѬе.",
      "err.msg.PROVIDER_AUTH_REJECTED": "�xѬовайдеѬ ���� о�клонил ђ�!��н�9е данн�9е, нас�Ѭоенн�9е на э�ом сеѬвеѬе.",
      "err.msg.PROVIDER_MODEL_UNAVAILABLE": "����-модел�R вѬеменно недос�ђпна. СкоѬо пов�оѬи�е поп�9�кђ.",
      "err.msg.RATE_LIMITED": "�ос�игнђ� лими� запѬосов пѬовайдеѬа ����. �xодожди�е немного и пов�оѬи�е.",
      "err.msg.PROVIDER_ERROR": "�xѬовайдеѬ ���� веѬнђл непѬедвиденнђ�} о��ибкђ.",
      "err.msg.PROVIDER_UNREACHABLE": "Не ђдалос�R подкл�}�!и��Rся к се�и пѬовайдеѬа ����.",
      "err.msg.MALFORMED_RESPONSE": "���� веѬнђл о�ве�, ко�оѬ�9й не ђдалос�R ѬазобѬа��R.",
      "err.msg.STAGE_FAILED": "�~дин из э�апов анализа завеѬ��ился о��ибкой.",
      "err.rec.PROVIDER_AUTH_REJECTED": "�xѬовеѬ�R�е API-кл�}�! пѬовайдеѬа ���� в кон�игђѬа� ии сеѬвеѬа.",
      "err.rec.PROVIDER_MODEL_UNAVAILABLE": "�xов�оѬи�е �!еѬез нескол�Rко минђ� или вкл�}�!и�е демо-Ѭежим.",
      "err.rec.RATE_LIMITED": "�xодожди�е около минђ��9 и нажми�е «�xов�оѬи��R анализ».",
      "err.rec.DEFAULT": "Нажми�е «�xов�оѬи��R анализ». �\"сли о��ибка пов�оѬяе�ся, вкл�}�!и�е демо-Ѭежим.",
      "validate.company": "�веди�е название ва��ей компании.",
      "validate.product": "�~пи��и�е ва�� пѬодђк� или ђслђгђ.",
      "validate.target": "��9беѬи�е � елевой Ѭ�9нок.",
      "validate.industry": "��9беѬи�е ва��ђ о�Ѭасл�R.",
      "act.total": "�сего дейс�вий",
      "act.critical": "�aѬи�и�!еские",
      "act.completed": "�авеѬ��ено",
      "act.daysReady": "�ней до го�овнос�и",
      "plan.total": "�сего {d} дн. (~{w} нед.)",
      "plan.criticalPath": "кѬи�и�!еский пђ��R: {p}",
      "plan.runToCompute": "�апђс�и�е анализ, �!�об�9 Ѭасс�!и�а��R план запђска.",
      "plan.actions": "дейс�вий: {n}",
      "plan.dayRange": "�ен�R {a}�{b}",
      "dd.target": "��9беѬи�е � елевой Ѭ�9нок⬦",
      "dd.industry": "��9беѬи�е о�Ѭасл�R⬦",
      "cmd.noMatch": "Не� команд, соо�ве�с�вђ�}�0и�& «{q}»",
      "industry.fintech": "ФинТе�&",
      "industry.banking-financial": "�анки и �инансов�9е ђслђги",
      "industry.healthcare": "�дѬавоо�&Ѭанение",
      "industry.healthtech": "�SедТе�&",
      "industry.edtech": "�~бѬазова�ел�Rн�9е �е�&нологии",
      "industry.ecommerce": "Элек�Ѭонная коммеѬ� ия",
      "industry.saas": "SaaS",
      "industry.ai-ml": "���� и ма��инное обђ�!ение",
      "industry.manufacturing": "�xѬоизводс�во",
      "industry.retail": "Розни�!ная �оѬговля",
      "industry.food-beverage": "�xѬодђк��9 и напи�ки",
      "industry.logistics": "�:огис�ика и � епо�!ки пос�авок",
      "industry.energy": "ЭнеѬге�ика",
      "industry.automotive": "Ав�омобил�Rная о�Ѭасл�R",
      "industry.telecommunications": "Телекоммђника� ии",
      "industry.insurance": "С�Ѭа�&ование",
      "industry.pharmaceuticals": "ФаѬма� ев�ика",
      "industry.travel-tourism": "�xђ�е��ес�вия и �ђѬизм",
      "industry.general": "�~б�0ее / �Ѭђгое"
    },

    ja: {
      "nav.dashboard": "㒬㒒��㒥�S㒼�0",
      "nav.canILaunch": "�\"�売でき�9�x",
      "nav.agentIntel": "��㒼����㒳����㒳� 㒪����㒳��",
      "nav.requirements": "要件",
      "nav.gapAnalysis": "��㒣㒒��� �~�",
      "nav.actionPlan": "������㒧㒳�㒩㒳",
      "nav.costEstimator": "�������9積�`",
      "nav.docLibrary": "�0��㒥㒡㒳��㒩���㒩㒪",
      "nav.regWatch": "規�ƶ����㒒㒁",
      "nav.updates": "��㒒��!㒼��",
      "nav.impactAnalysis": "影�x��� �~�",
      "nav.group.analyze": "�� �~�",
      "nav.group.monitor": "�:��",
      "help.title": "�`�:��`で�\"�9�x",
      "help.text": "��㒳�㒩����㒳��の���家に�:��!�\"�9",
      "help.book": "�a話�����\"�9",
      "crumb.marketReadiness": "�場��\"�`�況",
      "crumb.settings": "設�a",
      "crumb.profile": "�㒭�\"��㒼㒫",
      "charts.empty": "表示�\"�9�!㒼��はまだ��`ま�:��",
      "dashboard.totalRequirements": "要件の����",
      "dashboard.riskLevel": "㒪����㒬�\"㒫",
      "dashboard.estimatedDays": "�}��a���\"�",
      "dashboard.complianceProgress": "��㒳�㒩����㒳��鬲�",
      "cost.total": "�}��a総������",
      "gap.totalGaps": "�S�解決の��㒣㒒�",
      "gap.critical": "�!�大",
      "gap.high": "��",
      "gap.medium": "中",
      "gap.low": "�}",
      "req.statusCompleted": "�R� ",
      "req.statusInProgress": "鬲�R中",
      "req.statusPending": "保�\"\"中",
      "req.statusNA": "該�な�",
      "sev.critical": "�!�大",
      "sev.high": "��",
      "sev.medium": "中",
      "sev.low": "�}",
      "sev.info": "�&報",
      "prio.high": "���&�度�a��",
      "prio.medium": "���&�度�a中",
      "prio.low": "���&�度�a�}",
      "time.day": "��",
      "time.days": "���",
      "time.publishedOn": "{d} に�&��9",
      "time.more": "+{n} 件⬦",
      "common.update": "�:���",
      "common.complete": "�R� ",
      "common.none": "な�",
      "common.viewDetails": "詳細��9�9",
      "reg.label": "規�ƶ",
      "reg.kind.new": "��規規�ƶ",
      "reg.kind.amendment": "��正",
      "reg.kind.update": "�:���",
      "reg.kind.repeal": "廒止",
      "reg.kind.guidance": "����㒬㒳��",
      "stage.research": "�場調�x�",
      "stage.requirements": "要件�~㒒�㒳��",
      "stage.gaps": "��㒣㒒��� �~�",
      "stage.risks": "㒪�����\"価",
      "stage.actions": "������㒧㒳����",
      "stage.readiness": "��\"�`�況������㒪㒳��",
      "agent.name.research": "㒪��㒼㒁��㒼����㒳��",
      "agent.name.requirements": "要件��㒼����㒳��",
      "agent.name.gaps": "��㒣㒒���㒼����㒳��",
      "agent.name.risk": "㒪������㒼����㒳��",
      "agent.name.actions": "������㒧㒳��㒼����㒳��",
      "agent.purpose.research": "製��に適���\"�R�9可蒽欧の��9規�ƶ��0��a�ま�\"",
      "agent.purpose.requirements": "規�ƶ��&���aな��㒳�㒩����㒳��要件に�0�:�ま�\"",
      "agent.purpose.gaps": "貴社と��㒳�㒩����㒳��の�に欠�て��9�の��9つ�ま�\"",
      "agent.purpose.risk": "�\"�売㒪����と�9業への影�x���\"価�ま�\"",
      "agent.purpose.actions": "���&�� 位��きの���������S�Ɛ�ま�\"",
      "ai.byPriority": "���&�度�ƥの要件",
      "ai.bySeverity": "深�ƻ度�ƥの��㒣㒒�",
      "ai.countReqs": "要件 {n} 件",
      "ai.countGaps": "��㒣㒒� {n} 件",
      "ai.more": "+{n} 件⬦",
      "ai.sum.research": "適��可蒽欧の��9規�ƶ��㒼��� {n} 件�0��a�ま��x{extra}�",
      "ai.sum.reqs": "��㒳�㒩����㒳��要件� {n} 件�x�Ɛ�ま��x{extra}�",
      "ai.sum.gaps": "��㒳�㒩����㒳����㒣㒒�� {n} 件�S�!��ま��x{extra}�",
      "ai.sum.readiness": "��\"�`�況������: {p}%{extra}",
      "ai.sum.readinessPlain": "�場��\"�`�況���������!��ま��x�",
      "ai.sum.actions": "���&�� 位��き���������㒧㒳� {n} 件�x�Ɛ�ま��x{extra}�",
      "ai.extra.highConf": "����信頼度 {h} 件�0",
      "ai.extra.critical": "���!�大 {h} 件�0",
      "ai.extra.highPrio": "�������&�度 {h} 件�0",
      "ai.extra.risk": " 㒻㒪����㒬�\"㒫: {r}",
      "ai.extra.cost": " 㒻�}��a������: {c}",
      "verdict.noAnalysis": "�� �~���x�R�て�\"�売�Ƥ�a����ま��!� �",
      "verdict.prompt": "�a社名と製���&報��&��`:�\"�9と㬁�\"�売の��\"�R�\"�って��9�9確認できま�\"�",
      "verdict.ready": "{c} は {m} で {pr} ��\"�売�\"�9��\"�R {p}% �\"�って�ま�\"�",
      "verdict.pendingLeft": "�場��&��0�に�9�` {n} 件の保�\"\"中要件�解決�㬁規�ƶ㒪������:�0�ま��!� �",
      "verdict.allDone": "�\"べての要件�R対�S��みで�\" � �&�へ鬲��ま�\"�",
      "badge.ready": "�\"�売��\"�R� ",
      "badge.conditions": "条件��きGO",
      "badge.highrisk": "��㒪����",
      "badge.notready": "��\"�S�� ",
      "readiness.excellent": "��秬",
      "readiness.moderate": "中�9度",
      "readiness.low": "�}�",
      "readiness.excellentFull": "�!�要���xx�\"べてで規�ƶ対�S�R強�:�で�\"�",
      "readiness.moderateFull": "�0���x��:��R��`ま�\"�R㬁注���R�&要な���xx�R�くつ�9��`ま�\"�",
      "readiness.lowFull": "�\"�売�0�に大�&な��㒳�㒩����㒳��対�S�R�&要で�\"�",
      "empty.topPending.doneTitle": "�\"べて�0!��きま��x",
      "empty.topPending.doneDesc": "現�S�保�\"\"中の要件は��`ま�:��",
      "empty.topPending.noneTitle": "まだ保�\"\"�&�:�は��`ま�:�",
      "empty.topPending.noneDesc": "�� �~���x�R�て���&���㒥㒼��x�Ɛ�ま��!� �",
      "empty.dashTl.doneTitle": "����は� 調で�\"",
      "empty.dashTl.doneDesc": "������㒧㒳�㒩㒳に�S0�`�な�~��㒫����㒼㒳�R��`ま�\"�",
      "empty.dashTl.noneTitle": "����㒠㒩��㒳はまだ��`ま�:�",
      "empty.dashTl.noneDesc": "�� �~���R� �て�\"�売����㒠㒩��㒳��S�Ɛ�ま��!� �",
      "empty.watch.flagTitle": "�\"㒩����きの�0�:�は��`ま�:�",
      "empty.watch.flagDesc": "追跡中の規�ƶは�0�a�て�ま�\"�",
      "empty.watch.noneTitle": "まだ�\"�追跡�て�ま�:�",
      "empty.watch.noneDesc": "�場�追跡�て規�ƶの�0�:���:���ま��!� �",
      "empty.gaps": "��㒣㒒�は�S�!��\"�Rま�:�で��x�",
      "empty.actions.doneTitle": "�\"べての������㒧㒳�R� ",
      "empty.actions.doneDesc": "�\"べての������ 㒒��R�R� �ま��x�",
      "empty.actions.noneTitle": "������㒧㒳はまだ��`ま�:�",
      "empty.actions.noneDesc": "�� �~��R� �Rに������㒧㒳�R�x�Ɛ�\"�Rま�\"�",
      "empty.costs.hasData": "������は保�\"\"�&�:�と�場�㒭�\"����㒫�9�0�}��a�\"�Rて�ま�\"�",
      "empty.costs.none": "�� �~���x�R�て��㒳�㒩����㒳�������9積��`ま��!� �",
      "empty.updates.hasDataTitle": "�S���の��㒒��!㒼��",
      "empty.updates.hasDataDesc": "追跡中の�場に影�x��\"�9�S��の�0�:��",
      "empty.updates.noneTitle": "��㒒��!㒼��はまだ��`ま�:�",
      "empty.updates.noneDesc": "追跡中の規�ƶ�R�0���9と�:����R表示�\"�Rま�\"�",
      "update.fallback": "�:���",
      "empty.impact.hasDataTitle": "影�x�の�要",
      "empty.impact.hasDataDesc": "規�ƶ�0�:��R�9業に�}���9影�x��",
      "empty.impact.noneTitle": "影�x��!㒼��な�",
      "empty.impact.noneDesc": "規�ƶ�追跡�\"�9と影�x���㒳�������R表示�\"�Rま�\"�",
      "docs.emptyTitle": "�0��㒥㒡㒳��はまだ��`ま�:�",
      "docs.emptyDesc": "㒩����㒳��㒻証��}�:�㒻��㒳�㒩����㒳���\"����㒫���㒒�㒭㒼�0�て丬�&�管� �ま��!� �",
      "analyze.cta": "�� �~��\"�9",
      "analyze.running": "�� �~�中⬦",
      "analyze.complete": "�� �~��R�R� �ま��x",
      "err.title": "�� �~���R� できま�:�で��x",
      "err.stage": "��� 㒼��",
      "err.reason": "� ��",
      "err.error": "��㒩㒼",
      "err.action": "�}�奨������㒧㒳",
      "err.details": "詳細",
      "err.retryBtn": "�� �~��� �試�R",
      "err.msg.SERVER_UNREACHABLE": "ReguLens ��㒼㒐㒼に�}��aできま�:���}��a�確認�て� �試�R�てくだ�\"��",
      "err.msg.REQUEST_FAILED": "㒪���������R���Sx�:�a失�\"�ま��x��� 丬度�`試�くだ�\"��",
      "err.msg.AI_NOT_CONFIGURED": "�の��㒼㒐㒼では AI ��㒳��㒳�R設�a�\"�Rて�ま�:��",
      "err.msg.PROVIDER_AUTH_REJECTED": "AI �㒭㒐��㒬㒼�R�の��㒼㒐㒼の認証�&報��9否�ま��x�",
      "err.msg.PROVIDER_MODEL_UNAVAILABLE": "AI 㒢�!㒫は丬�\"�aに�Ʃ��できま�:���ば�0く�て�9�0� �試�R�てくだ�\"��",
      "err.msg.RATE_LIMITED": "AI �㒭㒐��㒬㒼の㒬㒼���ƶ�\"�に��ま��x����&って�9�0� �試�R�てくだ�\"��",
      "err.msg.PROVIDER_ERROR": "AI �㒭㒐��㒬㒼�R���Sx�な���㒩㒼���ま��x�",
      "err.msg.PROVIDER_UNREACHABLE": "AI �㒭㒐��㒬㒼の㒍㒒��㒯㒼��に�}��aできま�:�で��x�",
      "err.msg.MALFORMED_RESPONSE": "AI �R解�~�できな��S����ま��x�",
      "err.msg.STAGE_FAILED": "�� �~���� 㒼��の 1 つ�R失�\"�ま��x�",
      "err.rec.PROVIDER_AUTH_REJECTED": "��㒼㒐㒼設�aで AI �㒭㒐��㒬㒼の API ��㒼�確認�てくだ�\"��",
      "err.rec.PROVIDER_MODEL_UNAVAILABLE": "�\"��� �Rに� �試�R�\"�9�9㬁�!㒢㒢㒼�0に��!�`�:���てくだ�\"��",
      "err.rec.RATE_LIMITED": "1 �� ほど�&って�9�0�R�� �~��� �試�R㬍��`��てくだ�\"��",
      "err.rec.DEFAULT": "�R�� �~��� �試�R㬍��`��てくだ�\"��繰�`��失�\"�\"�9場��は�!㒢㒢㒼�0に��!�`�:���てくだ�\"��",
      "validate.company": "�a社名��&��`:�てくだ�\"��",
      "validate.product": "製��ま�xは��㒼����説��}�てくだ�\"��",
      "validate.target": "対象�場�選�`~�てくだ�\"��",
      "validate.industry": "業種�選�`~�てくだ�\"��",
      "act.total": "������㒧㒳����",
      "act.critical": "�!�大",
      "act.completed": "�R� ",
      "act.daysReady": "��\"�R� までの���\"�",
      "plan.total": "���� {d} ����� {w} 鬱��0",
      "plan.criticalPath": "��㒪� ����㒫���: {p}",
      "plan.runToCompute": "�� �~���x�R�て�\"�売�������!��ま��!� �",
      "plan.actions": "������㒧㒳 {n} 件",
      "plan.dayRange": "{a}�{b} ���:�",
      "dd.target": "対象�場�選�`~⬦",
      "dd.industry": "業種�選�`~⬦",
      "cmd.noMatch": "�R{q}㬍に丬�!��\"�9���~㒳�0は��`ま�:�",
      "industry.fintech": "�\"��㒳� 㒒��",
      "industry.banking-financial": "�`��R㒻�!�~���㒼���",
      "industry.healthcare": "��㒫������",
      "industry.healthtech": "��㒫��� 㒒��",
      "industry.edtech": "���0� 㒒��",
      "industry.ecommerce": "E ���~㒼��",
      "industry.saas": "SaaS",
      "industry.ai-ml": "AI㒻�x械学�",
      "industry.manufacturing": "製鬠業",
      "industry.retail": "小売",
      "industry.food-beverage": "�x��㒻飲�\"",
      "industry.logistics": "�0�流㒻���㒩��㒁��㒼㒳",
      "industry.energy": "��㒍㒫��㒼",
      "industry.automotive": "�!��9\"�`",
      "industry.telecommunications": "�a信",
      "industry.insurance": "保�\"�",
      "industry.pharmaceuticals": "製��",
      "industry.travel-tourism": "�&�R㒻観�&0",
      "industry.general": "丬�Ƭ / その�"
    },

    zh: {
      "nav.dashboard": "仪表板",
      "nav.canILaunch": "��蒽�`���x",
      "nav.agentIntel": "�\"�蒽��&�`�",
      "nav.requirements": "���要�",
      "nav.gapAnalysis": "差距�� �~�",
      "nav.actionPlan": "�R�`�计��",
      "nav.costEstimator": "�Ɛ�S�估��\"�",
      "nav.docLibrary": "�!档�",
      "nav.regWatch": "�\"��:�}�",
      "nav.updates": "�`�欁�:���",
      "nav.impactAnalysis": "影���� �~�",
      "nav.group.analyze": "�� �~�",
      "nav.group.monitor": "�:�}�",
      "help.title": "�S�要帮�`���x",
      "help.text": "�}��们�a����家交流",
      "help.book": "�约�a话",
      "crumb.marketReadiness": "��S��! �!度",
      "crumb.settings": "设置",
      "crumb.profile": "个人��\"",
      "charts.empty": "�a��可�ܾ示�a�\"�据�",
      "dashboard.totalRequirements": "要�欻�\"�",
      "dashboard.riskLevel": "�}�\"��0级",
      "dashboard.estimatedDays": "�计天�\"�",
      "dashboard.complianceProgress": "����:度",
      "cost.total": "�计欻�Ɛ�S�",
      "gap.totalGaps": "�S�解� �差距",
      "gap.critical": "严�!�",
      "gap.high": "��",
      "gap.medium": "中",
      "gap.low": "�}",
      "req.statusCompleted": "已�R�Ɛ",
      "req.statusInProgress": "�:�R中",
      "req.statusPending": "�&�� ",
      "req.statusNA": "不���",
      "sev.critical": "严�!�",
      "sev.high": "��",
      "sev.medium": "中",
      "sev.low": "�}",
      "sev.info": "提示",
      "prio.high": "�����&�级",
      "prio.medium": "中���&�级",
      "prio.low": "�}���&�级",
      "time.day": "天",
      "time.days": "天",
      "time.publishedOn": "�帒�} {d}",
      "time.more": "另� {n} 条⬦",
      "common.update": "�:���",
      "common.complete": "已�R�Ɛ",
      "common.none": "��",
      "common.viewDetails": "�x��S9详�&",
      "reg.label": "�\"�",
      "reg.kind.new": "���\"�",
      "reg.kind.amendment": "修正��",
      "reg.kind.update": "�:���",
      "reg.kind.repeal": "�x止",
      "reg.kind.guidance": "�R!�\"",
      "stage.research": "��S�谒�",
      "stage.requirements": "要��ܠ�",
      "stage.gaps": "差距�� �~�",
      "stage.risks": "�}�\"��估",
      "stage.actions": "�R�`�计��",
      "stage.readiness": "�! �!度��� ",
      "agent.name.research": "谒��\"�蒽�",
      "agent.name.requirements": "要��\"�蒽�",
      "agent.name.gaps": "差距�\"�蒽�",
      "agent.name.risk": "�}�\"��\"�蒽�",
      "agent.name.actions": "�R�`��\"�蒽�",
      "agent.purpose.research": "� �ƫ可蒽����}��产���a�\"�",
      "agent.purpose.requirements": "� �\"�转�R为�&���a���要�",
      "agent.purpose.gaps": "�0��!�贵司�}����9��缺失�a钨�� ",
      "agent.purpose.risk": "�估�`��}�\"��}�a�`�影��",
      "agent.purpose.actions": "�ƶ�a�R0���&�级�}序�a�\"���计��",
      "ai.byPriority": "�R0���&�级�}���a要�",
      "ai.bySeverity": "�R0严�!��9度�}���a差距",
      "ai.countReqs": "{n} 项要�",
      "ai.countGaps": "{n} 个差距",
      "ai.more": "另�S0 {n} 条⬦",
      "ai.sum.research": "已� �ƫ {n} 个可蒽����a�\"�来源{extra}�",
      "ai.sum.reqs": "已�x�Ɛ {n} 项���要�{extra}�",
      "ai.sum.gaps": "��}� {n} 个���差距{extra}�",
      "ai.sum.readiness": "�! �!度��� �a{p}%{extra}",
      "ai.sum.readinessPlain": "已计���S��! �!度��� �",
      "ai.sum.actions": "已�x�Ɛ {n} 项�R0���&�级�}序�a�\"����R�`�{extra}�",
      "ai.extra.highConf": "��{h} 个��置信度�0",
      "ai.extra.critical": "��{h} 个严�!��0",
      "ai.extra.highPrio": "��{h} 个�����&�级�0",
      "ai.extra.risk": " · �}�\"��0级�a{r}",
      "ai.extra.cost": " · �计�Ɛ�S��a{c}",
      "verdict.noAnalysis": "运�R�� �~�以�}�����a�`��Ƥ�a�",
      "verdict.prompt": "��&����a�&�司�R产��信息�R�x��S9�ܯ否可以�`��",
      "verdict.ready": "{c} 已为�S� {m} �`� {pr} �a好 {p}% �a�! �!�",
      "verdict.pendingLeft": "�:�&���S��0�请解� ��0��\"�a {n} 项�&�� 要��R以�\"��}����}�\"��",
      "verdict.allDone": "�0��S0要��!已�� ����可以继续�}��:�",
      "badge.ready": "可�`�",
      "badge.conditions": "�S0条件�a�!",
      "badge.highrisk": "���}�\"�",
      "badge.notready": "�a�S�就绪",
      "readiness.excellent": "��秬",
      "readiness.moderate": "中�0",
      "readiness.low": "辒�}",
      "readiness.excellentFull": "�0��S0�&���� �xx�a�:管�! �!工�S钽���0}�~�",
      "readiness.moderateFull": "�x�硬�0�好�R� �S0�9�干� �xx�S�要�&�注�",
      "readiness.lowFull": "�`��0��S�要�:�R大�!����工�S�",
      "empty.topPending.doneTitle": "�&�钨�� �R�\"",
      "empty.topPending.doneDesc": "�:��0�没�S0�&�� �a要��",
      "empty.topPending.noneTitle": "�a���&�`~�9项",
      "empty.topPending.noneDesc": "运�R�� �~�以�x�Ɛ���a���&���x���",
      "empty.dashTl.doneTitle": "计���:�\"顺�Ʃ",
      "empty.dashTl.doneDesc": "���a�R�`�计��中�S0正�S��:�R�a�!R�9��",
      "empty.dashTl.noneTitle": "�a������线",
      "empty.dashTl.noneDesc": "�R�Ɛ丬次�� �~�以�x�Ɛ�`�����表�",
      "empty.watch.flagTitle": "没�S0�!记�a���:�",
      "empty.watch.flagDesc": "�x踪中�a�\"�保�R�稳�a�",
      "empty.watch.noneTitle": "�a�S��x踪任�\"� &容",
      "empty.watch.noneDesc": "�x踪��S�以�:�}��\"����R�",
      "empty.gaps": "�S�棬�9�ư差距�",
      "empty.actions.doneTitle": "�0��S0�R�`�已�R�Ɛ",
      "empty.actions.doneDesc": "每个�\"���步骤�!已�R�Ɛ�",
      "empty.actions.noneTitle": "�a���R�`�项",
      "empty.actions.noneDesc": "�� �~��R�Ɛ�}� �x�Ɛ�R�`�项�",
      "empty.costs.hasData": "�Ɛ�S�根据���a�&�`~�9项�R��S��� ��:�R估��",
      "empty.costs.none": "运�R�� �~�以估����a������",
      "empty.updates.hasDataTitle": "�S����`�欁",
      "empty.updates.hasDataDesc": "影�����0��x踪��S��a��Sx���R�",
      "empty.updates.noneTitle": "�a���`�欁",
      "empty.updates.noneDesc": "��x踪�a�\"���x���R���a�!��}��`�欁�",
      "update.fallback": "�:���",
      "empty.impact.hasDataTitle": "影�����",
      "empty.impact.hasDataDesc": "�\"����R��\"影�����a�a�`��",
      "empty.impact.noneTitle": "�a��影���\"�据",
      "empty.impact.noneDesc": "�x踪�\"��}�a�!��}�影���~�x�",
      "docs.emptyTitle": "�a���!档",
      "docs.emptyDesc": "�`传许可证㬁证书�R����!件�R�: 中管� �0��S0��\"�",
      "analyze.cta": "弬�9�� �~�",
      "analyze.running": "�� �~�中⬦",
      "analyze.complete": "�� �~��R�Ɛ",
      "err.title": "���\"�R�Ɛ�� �~�",
      "err.stage": "�ܶ段",
      "err.reason": "�}x�:�",
      "err.error": "�\"误",
      "err.action": "建议���S",
      "err.details": "详�&",
      "err.retryBtn": "�!��\"�� �~�",
      "err.msg.SERVER_UNREACHABLE": "���\"�~�}� ReguLens �S��`��\"��请棬�x���S�}�!��\"�",
      "err.msg.REQUEST_FAILED": "请����失败�请�!��\"�",
      "err.msg.AI_NOT_CONFIGURED": "此�S��`��\"��`�S��&�置 AI �\"�}�",
      "err.msg.PROVIDER_AUTH_REJECTED": "AI �S��`��\" �9绝� 此�S��`��\"��&�置�a�!�据�",
      "err.msg.PROVIDER_MODEL_UNAVAILABLE": "AI 模�~9�a��不可���请稍�}�!��\"�",
      "err.msg.RATE_LIMITED": "已达�ư AI �S��`��\" �a�x�}!�\"��ƶ�请稍�0�0!�ƻ� ��\"�",
      "err.msg.PROVIDER_ERROR": "AI �S��`��\" ��:~� ����\"误�",
      "err.msg.PROVIDER_UNREACHABLE": "���\"�~�}� AI �S��`��\" �a��S�",
      "err.msg.MALFORMED_RESPONSE": "AI ��:~�a������\"解�~��",
      "err.msg.STAGE_FAILED": "�&�中丬个�� �~��ܶ段失败� �",
      "err.rec.PROVIDER_AUTH_REJECTED": "请�S��S��`��\"��&�置中核对 AI �S��`��\" �a API � ���",
      "err.rec.PROVIDER_MODEL_UNAVAILABLE": "�!��� �x�}�!��\"�R����!换�ư�示模式�",
      "err.rec.RATE_LIMITED": "�0�&约丬�� �x�}���!��S�!��\"�� �~�⬝�",
      "err.rec.DEFAULT": "���!��S�!��\"�� �~�⬝���~S仍��失败�R请��!换�ư�示模式�",
      "validate.company": "请��&����a�&�司名称�",
      "validate.product": "请描述���a产�����S��`��",
      "validate.target": "请�0�9��:��!��S��",
      "validate.industry": "请�0�9����a�R�a�",
      "act.total": "�R�`�欻�\"�",
      "act.critical": "严�!�",
      "act.completed": "已�R�Ɛ",
      "act.daysReady": "距就绪天�\"�",
      "plan.total": "�&� {d} 天��约 {w} ���0",
      "plan.criticalPath": "�&���路��a{p}",
      "plan.runToCompute": "运�R�� �~�以计����a�`�计���",
      "plan.actions": "{n} 项�R�`�",
      "plan.dayRange": "第 {a}�{b} 天",
      "dd.target": "�0�9��:��!��S�⬦",
      "dd.industry": "�0�9��R�a⬦",
      "cmd.noMatch": "没�S0�}�S{q}⬝�R��&��a��令",
      "industry.fintech": "�!�~���`�",
      "industry.banking-financial": "���R�}�!�~��S��`�",
      "industry.healthcare": "�R��健康",
      "industry.healthtech": "�R����`�",
      "industry.edtech": "�\"\"����`�",
      "industry.ecommerce": "��子�\" �`�",
      "industry.saas": "SaaS",
      "industry.ai-ml": "人工�\"�蒽�}�S��\"�学习",
      "industry.manufacturing": "�ƶ鬠�a",
      "industry.retail": "�:���",
      "industry.food-beverage": "�x��饮�\"",
      "industry.logistics": "�0�流�}�:���",
      "industry.energy": "蒽源",
      "industry.automotive": "汽车",
      "industry.telecommunications": "��信",
      "industry.insurance": "保�\"�",
      "industry.pharmaceuticals": "�ƶ药",
      "industry.travel-tourism": "�&游",
      "industry.general": "�a�� / �&��"
    },

    ko: {
      "nav.dashboard": "�R��9S보�S",
      "nav.canILaunch": "�S�9S 갬�`��\"��R�a?",
      "nav.agentIntel": "��이��`� 인�&리��`�",
      "nav.requirements": "�a구���\"�",
      "nav.gapAnalysis": "갭 ���",
      "nav.actionPlan": "�9��0 ��a�",
      "nav.costEstimator": "��a� ��\"기",
      "nav.docLibrary": "문�S 라이�R�x�리",
      "nav.regWatch": "�S�S 감�9S",
      "nav.updates": "�&데이�`�",
      "nav.impactAnalysis": "�܁�� ���",
      "nav.group.analyze": "���",
      "nav.group.monitor": "모�9���링",
      "help.title": "��:�이 �\"�a�\"��9�갬�a?",
      "help.text": "컴�R라이���`� �문갬�\"� 쒁�9��\"����a",
      "help.book": "� ��\" ����\"��\"�기",
      "crumb.marketReadiness": "�9S�~� 줬��",
      "crumb.settings": "���\"",
      "crumb.profile": "��S�\"",
      "charts.empty": "�S�9S�\"� 데이��갬 �\"직 � �`��9��9�.",
      "dashboard.totalRequirements": "총 �a구���\"�",
      "dashboard.riskLevel": "�S�� ���줬",
      "dashboard.estimatedDays": "���쒁 � R�a일",
      "dashboard.complianceProgress": "컴�R라이���`� ��0률",
      "cost.total": "총 ���쒁 ��a�",
      "gap.totalGaps": "미�\"�결 갭",
      "gap.critical": "���&적",
      "gap.high": "� �R",
      "gap.medium": "��",
      "gap.low": "���R",
      "req.statusCompleted": "�\"�R",
      "req.statusInProgress": "��0 �",
      "req.statusPending": "�R�기 �",
      "req.statusNA": "�\"��9� � �R",
      "sev.critical": "���&적",
      "sev.high": "� �R",
      "sev.medium": "��",
      "sev.low": "���R",
      "sev.info": "�\"보",
      "prio.high": "� 읬 �a�����S�S",
      "prio.medium": "�� �a�����S�S",
      "prio.low": "��읬 �a�����S�S",
      "time.day": "일",
      "time.days": "일",
      "time.publishedOn": "{d} �R�9S됨",
      "time.more": "+{n}�S �⬦",
      "common.update": "�&데이�`�",
      "common.complete": "�\"�R",
      "common.none": "� �R",
      "common.viewDetails": "쒁�� 보기",
      "reg.label": "�S�S",
      "reg.kind.new": "�9��S �S�S",
      "reg.kind.amendment": "�S�\"",
      "reg.kind.update": "�&데이�`�",
      "reg.kind.repeal": "폐짬",
      "reg.kind.guidance": "갬이�S라인",
      "stage.research": "�9S�~� 조��",
      "stage.requirements": "�a구���\"� 매�\"",
      "stage.gaps": "갭 ���",
      "stage.risks": "리�`�크 �0갬",
      "stage.actions": "�9��0 ��a� ���립",
      "stage.readiness": "줬�� 점��� ���\"",
      "agent.name.research": "리�S�� ��이��`�",
      "agent.name.requirements": "�a구���\"� ��이��`�",
      "agent.name.gaps": "갭 ��이��`�",
      "agent.name.risk": "리�`�크 ��이��`�",
      "agent.name.actions": "�\"��&� ��이��`�",
      "agent.purpose.research": "�S���� 적�a�될 ��� �~��` �S�S를 �9���\"��9��9�",
      "agent.purpose.requirements": "�S�S를 구체적인 컴�R라이���`� �a구���\"��S��S ��\"��\"��9��9�",
      "agent.purpose.gaps": "컴�R라이���`��R짬 붬족�\"S 붬�� 찾�\"�&�9��9�",
      "agent.purpose.risk": "�S�9S 리�`�크�\"� ���& �܁��� �0갬�\"��9��9�",
      "agent.purpose.actions": "�a�����S�S갬 �\"렬�S �S�� ��a�� ���립�\"��9��9�",
      "ai.byPriority": "�a�����S�S� �a구���\"�",
      "ai.bySeverity": "�9�각�� 갭",
      "ai.countReqs": "�a구���\"� {n}건",
      "ai.countGaps": "갭 {n}건",
      "ai.more": "+{n}건 �⬦",
      "ai.sum.research": "적�a� 갬�`���이 �~��` �S�S � R�`� {n}건� �9�����`��9��9�{extra}.",
      "ai.sum.reqs": "컴�R라이���`� �a구���\"� {n}건� 쒝�����`��9��9�{extra}.",
      "ai.sum.gaps": "컴�R라이���`� 갭 {n}건� �S견���`��9��9�{extra}.",
      "ai.sum.readiness": "줬�� 점���: {p}%{extra}",
      "ai.sum.readinessPlain": "�9S�~� 줬�� 점���를 ���S���`��9��9�.",
      "ai.sum.actions": "�a�����S�S�\"�S �S�� 조�� {n}건� 쒝�����`��9��9�{extra}.",
      "ai.extra.highConf": " (고�9�뢰 {h}건)",
      "ai.extra.critical": " (���&적 {h}건)",
      "ai.extra.highPrio": " (� 읬 �a�����S�S {h}건)",
      "ai.extra.risk": " · �S�� ���줬: {r}",
      "ai.extra.cost": " · ���쒁 ��a�: {c}",
      "verdict.noAnalysis": "���� �9��0�\"��� �S�9S �R��\"� �:�\"보���a.",
      "verdict.prompt": "�aR���\"� �S�� �\"보를 �~&력�\"�면 �S�9S 줬� ��붬를 �\"\"인�\"� ��� �~��`��9��9�.",
      "verdict.ready": "{c}읬(�`) {m}���S {pr}�(를) �S�9S�\"� 줬�갬 {p}% �����`��9��9�.",
      "verdict.pendingLeft": "�S�S 리�`�크를 �이려면 �9S�~� ��~& � ��읬 �R�기 �a구���\"� {n}건� �\"�결�\"����a.",
      "verdict.allDone": "모�� �a구���\"�이 ��리�����`��9��9� � ��0�\"� ��� �~��`��9��9�.",
      "badge.ready": "�S�9S 줬� �\"�R",
      "badge.conditions": "조건붬 GO",
      "badge.highrisk": "고�S��",
      "badge.notready": "줬� �\"� 됨",
      "readiness.excellent": "풁�:�\"�",
      "readiness.moderate": "보� �",
      "readiness.low": "���R",
      "readiness.excellentFull": "모�� �\"��9� �܁�����S �\"력�\"S �S�S �R��력� �����`��9��9�.",
      "readiness.moderateFull": "���\"S 기��이며 주��갬 �\"�a�\"S �܁��이 일붬 �~��`��9��9�.",
      "readiness.lowFull": "�S�9S � 쒁�9��\"S 컴�R라이���`� �~�&이 �\"�a�\"��9��9�.",
      "empty.topPending.doneTitle": "모�� �\"리�����`��9��9�",
      "empty.topPending.doneDesc": "���~� �R�기 �인 �a구���\"�이 � �`��9��9�.",
      "empty.topPending.noneTitle": "�\"직 �R�기 �\"�목이 � �`��9��9�",
      "empty.topPending.noneDesc": "���� �9��0�\"��� �a�����S�S 큐를 쒝���\"����a.",
      "empty.dashTl.doneTitle": "��a� ��S조롭�R ��0 �",
      "empty.dashTl.doneDesc": "�9��0 ��a��� �\"S�� ��일�`�� �이 �~��`��9��9�.",
      "empty.dashTl.noneTitle": "풬�~라인이 �\"직 � �`��9��9�",
      "empty.dashTl.noneDesc": "���� �\"�R�\"��� �S�9S 풬�~라인� �R�S���a.",
      "empty.watch.flagTitle": "�S�9S�S 볬경 ���\"� � �R",
      "empty.watch.flagDesc": "�적 �인 �S�S�` �\"��\"적�~&�9��9�.",
      "empty.watch.noneTitle": "�\"직 �적 �인 �\"�목이 � �`��9��9�",
      "empty.watch.noneDesc": "�9S�~�� �갬�\"� �S�S 볬�\"를 모�9���링�\"����a.",
      "empty.gaps": "�S견�S 갭이 � �`��9��9�.",
      "empty.actions.doneTitle": "모�� 조�� �\"�R",
      "empty.actions.doneDesc": "모�� �S�� �9��갬 �\"�R�����`��9��9�.",
      "empty.actions.noneTitle": "�\"직 조��갬 � �`��9��9�",
      "empty.actions.noneDesc": "��� �\"�R �: 조��갬 쒝��됩�9��9�.",
      "empty.costs.hasData": "��a�읬 미�\"�결 �\"�목과 �9S�~� ��S�\"� 기���S��S ��\"됩�9��9�.",
      "empty.costs.none": "���� �9��0�\"��� 컴�R라이���`� ������ ��\"�\"����a.",
      "empty.updates.hasDataTitle": "�S�9� �&데이�`�",
      "empty.updates.hasDataDesc": "�적 �인 �9S�~��� �܁��� 주�` �S근 볬경 ���\"�.",
      "empty.updates.noneTitle": "�\"직 �&데이�`�갬 � �`��9��9�",
      "empty.updates.noneDesc": "�적 �인 �S�S갬 볬경��면 �&데이�`�갬 �S�9S됩�9��9�.",
      "update.fallback": "�&데이�`�",
      "empty.impact.hasDataTitle": "�܁�� �S�a",
      "empty.impact.hasDataDesc": "�S�S 볬�\"갬 ���&�� 미���` �܁��.",
      "empty.impact.noneTitle": "�܁�� 데이�� � �R",
      "empty.impact.noneDesc": "�S�S를 �적�\"�면 �܁�� 인��이�`�갬 �S�9S됩�9��9�.",
      "docs.emptyTitle": "문�S갬 �\"직 � �`��9��9�",
      "docs.emptyDesc": "라이���`�, 인증�S, 컴�R라이���`� �RR일� �&�S�S�\"��� �\"S곳���S 괬리�\"����a.",
      "analyze.cta": "����\"�기",
      "analyze.running": "��� �⬦",
      "analyze.complete": "��� �\"�R",
      "err.title": "���� �\"�R�\"� ��� � �`��9��9�",
      "err.stage": "�9��",
      "err.reason": "�:�인",
      "err.error": "�ܤ��",
      "err.action": "�R�~� 조��",
      "err.details": "��붬 �\"보",
      "err.retryBtn": "��� �~��9S�",
      "err.msg.SERVER_UNREACHABLE": "ReguLens �S��� ��결�\"� ��� � �`��9��9�. ��결� �\"\"인�\"�고 �9��9S �9S��\"����a.",
      "err.msg.REQUEST_FAILED": "�a청이 ���기�� �\"`�R �9��R����`��9��9�. �9��9S �9S��\"����a.",
      "err.msg.AI_NOT_CONFIGURED": "이 �S����` AI ��이 구������ �~�짬 �\"`�`��9��9�.",
      "err.msg.PROVIDER_AUTH_REJECTED": "AI 공�0�~�갬 이 �S��� 구���S �~�격 증�&� 거붬���`��9��9�.",
      "err.msg.PROVIDER_MODEL_UNAVAILABLE": "AI 모델� 일�9S적�S��S ���a��\"� ��� � �`��9��9�. �~��9S �: �9��9S �9S��\"����a.",
      "err.msg.RATE_LIMITED": "AI 공�0�~��� �a청 �\"S��� ��9����`��9��9�. �~��9S �: �9��9S �9S��\"����a.",
      "err.msg.PROVIDER_ERROR": "AI 공�0�~�갬 ���기�� �\"`읬 �ܤ��를 ���\"����`��9��9�.",
      "err.msg.PROVIDER_UNREACHABLE": "AI 공�0�~� ���`��:R크�� ��결�\"� ��� � �`��9��9�.",
      "err.msg.MALFORMED_RESPONSE": "AI갬 �RR�9��\"� ��� � �` ��9�� ���\"����`��9��9�.",
      "err.msg.STAGE_FAILED": "��� �9�� � �\"���갬 �9��R����`��9��9�.",
      "err.rec.PROVIDER_AUTH_REJECTED": "�S� ���\"���S AI 공�0�~� API ��를 �\"\"인�\"����a.",
      "err.rec.PROVIDER_MODEL_UNAVAILABLE": "�! � �: �9��9S �9S��\"�거�� 데모 모�S�S ��\"��\"����a.",
      "err.rec.RATE_LIMITED": "�\"� 1� �:�� '��� �~��9S�'를 ��르���a.",
      "err.rec.DEFAULT": "'��� �~��9S�'를 ��르���a. �� � �9��R��\"�면 데모 모�S�S ��\"��\"����a.",
      "validate.company": "�aR�� 이�� �~&력�\"����a.",
      "validate.product": "�S�� �ܐ�` �S��`�를 ���&�\"����a.",
      "validate.target": "�R�쒁 �9S�~�� ��풝�\"����a.",
      "validate.industry": "�&�&� ��풝�\"����a.",
      "act.total": "총 조��",
      "act.critical": "���&적",
      "act.completed": "�\"�R",
      "act.daysReady": "줬� �\"�R�R짬 ��읬 일���",
      "plan.total": "총 {d}일 (�\"� {w}주)",
      "plan.criticalPath": "��a 경�S: {p}",
      "plan.runToCompute": "���� �9��0�\"��� �S�9S ��a�� ���S�\"����a.",
      "plan.actions": "조�� {n}건",
      "plan.dayRange": "{a}�{b}일차",
      "dd.target": "�R�쒁 �9S�~� ��풝⬦",
      "dd.industry": "�&�& ��풝⬦",
      "cmd.noMatch": "\"{q}\"�\"�(과) 일���\"��` �&령이 � �`��9��9�",
      "industry.fintech": "�\"��&R크",
      "industry.banking-financial": "읬�0 및 ���S� �S��`�",
      "industry.healthcare": "���`�켬��",
      "industry.healthtech": "���`��&R크",
      "industry.edtech": "�����&R크",
      "industry.ecommerce": "이커머�`�",
      "industry.saas": "SaaS",
      "industry.ai-ml": "AI·머�9��x��9�",
      "industry.manufacturing": "�S조�&",
      "industry.retail": "리�&R일",
      "industry.food-beverage": "�9���·�R�R",
      "industry.logistics": "물��·공�0망",
      "industry.energy": "����짬",
      "industry.automotive": "�~��\"차",
      "industry.telecommunications": "� ��9�",
      "industry.insurance": "보��",
      "industry.pharmaceuticals": "�S�\"�",
      "industry.travel-tourism": "���0·괬�",
      "industry.general": "일�� / 기풬"
    },

    hi: {
      "nav.dashboard": "ड��शब�9र्ड",
      "nav.canILaunch": "�\"्या म��� ल�0न्�a �\"र स�\"ता ह�ँ?",
      "nav.agentIntel": "ए�S�!��x �!��x�!लि�S�!�स",
      "nav.requirements": "� वश्य�\"ताएँ",
      "nav.gapAnalysis": "���प विश्ल�!षण",
      "nav.actionPlan": "�\"ार्रवा�� य�9�Sना",
      "nav.costEstimator": "ला�त �&नुमान�\"",
      "nav.docLibrary": "दस्ताव�!�S़ ला�!ब्र�!र६",
      "nav.regWatch": "नियाम�\" नि�रान६",
      "nav.updates": "�&पड�!�x",
      "nav.impactAnalysis": "प्रभाव विश्ल�!षण",
      "nav.group.analyze": "विश्ल�!षण",
      "nav.group.monitor": "नि�रान६",
      "help.title": "मदद �aाहिए?",
      "help.text": "हमार�! �\"�प्लाय�स विश�!ष�S्�~ स�! बात �\"र�!�",
      "help.book": "�\"�0ल बु�\" �\"र�!�",
      "crumb.marketReadiness": "बा�S़ार त��यार६",
      "crumb.settings": "स�!�xि��्स",
      "crumb.profile": "प्र�9फ़ा�!ल",
      "charts.empty": "दि�ान�! �\"�! लिए �&भ६ �\"�9�� ड�!�xा नह६� ह��।",
      "dashboard.totalRequirements": "�\"ुल � वश्य�\"ताएँ",
      "dashboard.riskLevel": "�S�9�िम स्तर",
      "dashboard.estimatedDays": "�&नुमानित दिन",
      "dashboard.complianceProgress": "�\"�प्लाय�स प्र�ति",
      "cost.total": "�\"ुल �&नुमानित ला�त",
      "gap.totalGaps": "�ुल�! ���प",
      "gap.critical": "��भ६र",
      "gap.high": "�0�a्�a",
      "gap.medium": "मध्यम",
      "gap.low": "निम्न",
      "req.statusCompleted": "प�र्ण",
      "req.statusInProgress": "प्र�ति पर",
      "req.statusPending": "ल�बित",
      "req.statusNA": "ला�� नह६�",
      "sev.critical": "��भ६र",
      "sev.high": "�0�a्�a",
      "sev.medium": "मध्यम",
      "sev.low": "निम्न",
      "sev.info": "स��aना",
      "prio.high": "�0�a्�a प्राथमि�\"ता",
      "prio.medium": "मध्यम प्राथमि�\"ता",
      "prio.low": "निम्न प्राथमि�\"ता",
      "time.day": "दिन",
      "time.days": "दिन",
      "time.publishedOn": "{d} �\"�9 प्र�\"ाशित",
      "time.more": "+{n} �र⬦",
      "common.update": "�&पड�!�x",
      "common.complete": "प�र्ण",
      "common.none": "�\"�9�� नह६�",
      "common.viewDetails": "विवरण द�!��!�",
      "reg.label": "विनियम",
      "reg.kind.new": "नया विनियम",
      "reg.kind.amendment": "स�श�9धन",
      "reg.kind.update": "�&पड�!�x",
      "reg.kind.repeal": "निरस्त६�\"रण",
      "reg.kind.guidance": "दिशानिर्द�!श",
      "stage.research": "बा�S़ार �&नुस�धान",
      "stage.requirements": "� वश्य�\"ता म��पि��",
      "stage.gaps": "���प विश्ल�!षण",
      "stage.risks": "�S�9�िम म�ल्या��\"न",
      "stage.actions": "�\"ार्रवा�� य�9�Sना",
      "stage.readiness": "त��यार६ स्�\"�9रि��",
      "agent.name.research": "रिसर्�a ए�S�!��x",
      "agent.name.requirements": "� वश्य�\"ता ए�S�!��x",
      "agent.name.gaps": "���प ए�S�!��x",
      "agent.name.risk": "रिस्�\" ए�S�!��x",
      "agent.name.actions": "ए�\"्शन ए�S�!��x",
      "agent.purpose.research": "� प�\"�! �0त्पाद पर ला�� ह�9 स�\"न�! वाल�! विनियम पह�aानता ह��",
      "agent.purpose.requirements": "विनियम�9� �\"�9 ठ�9स �\"�प्लाय�स � वश्य�\"ता�� म�!� बदलता ह��",
      "agent.purpose.gaps": "� प �र �\"�प्लाय�स �\"�! ब६�a �\"्या �\"म६ ह��, यह ढ�ँढता ह��",
      "agent.purpose.risk": "ल�0न्�a �S�9�िम �र व्यावसायि�\" प्रभाव �\"ा म�ल्या��\"न �\"रता ह��",
      "agent.purpose.actions": "प्राथमि�\"ता वाल६ सुधार य�9�Sना बनाता ह��",
      "ai.byPriority": "प्राथमि�\"ता �&नुसार � वश्य�\"ताएँ",
      "ai.bySeverity": "��भ६रता �&नुसार ���प",
      "ai.countReqs": "{n} � वश्य�\"ताएँ",
      "ai.countGaps": "{n} ���प",
      "ai.more": "+{n} �&धि�\"⬦",
      "ai.sum.research": "{n} स�भावित र�प स�! ला�� नियाम�\" स्र�9त पह�aान�! �ए{extra}।",
      "ai.sum.reqs": "{n} �\"�प्लाय�स � वश्य�\"ताएँ त��यार �\"६ ����{extra}।",
      "ai.sum.gaps": "{n} �\"�प्लाय�स ���प मिल�!{extra}।",
      "ai.sum.readiness": "त��यार६ स्�\"�9र: {p}%{extra}",
      "ai.sum.readinessPlain": "बा�S़ार त��यार६ स्�\"�9र �\"६ �णना हु��।",
      "ai.sum.actions": "{n} प्राथमि�\"ता-�\"्रमित सुधार �\"ार्रवा�!याँ त��यार हु���{extra}।",
      "ai.extra.highConf": " ({h} �0�a्�a-विश्वास)",
      "ai.extra.critical": " ({h} ��भ६र)",
      "ai.extra.highPrio": " ({h} �0�a्�a-प्राथमि�\"ता)",
      "ai.extra.risk": " · �S�9�िम स्तर: {r}",
      "ai.extra.cost": " · �&नुमानित ला�त: {c}",
      "verdict.noAnalysis": "ल�0न्�a निर्णय पान�! �\"�! लिए विश्ल�!षण �aलाएँ।",
      "verdict.prompt": "द�!�न�! �\"�! लिए �&पन६ �\"�पन६ �र �0त्पाद �\"६ �Sान�\"ार६ दर्�S �\"र�!� �\"ि � प ल�0न्�a �\"�! लिए त��यार ह��� या नह६�।",
      "verdict.ready": "{c} {m} म�!� {pr} ल�0न्�a �\"रन�! �\"�! लिए {p}% त��यार ह��।",
      "verdict.pendingLeft": "नियाम�\" �S�9�िम �\"म �\"रन�! �\"�! लिए बा�S़ार म�!� प्रव�!श स�! पहल�! श�!ष {n} ल�बित � वश्य�\"ताएँ प�र६ �\"र�!�।",
      "verdict.allDone": "सभ६ � वश्य�\"ताएँ प�र६ ह�9 ��� ह��� � � प � ��! बढ़ स�\"त�! ह���।",
      "badge.ready": "ल�0न्�a �\"�! लिए त��यार",
      "badge.conditions": "सशर्त �&नुमति",
      "badge.highrisk": "�0�a्�a �S�9�िम",
      "badge.notready": "त��यार नह६�",
      "readiness.excellent": "�0त्�\"॒ष्�x",
      "readiness.moderate": "मध्यम",
      "readiness.low": "निम्न",
      "readiness.excellentFull": "सभ६ ��भ६र �\"्ष�!त्र�9� म�!� म�S़ब�त नियाम�\" त��यार६।",
      "readiness.moderateFull": "�&�a्�:६ न६�व ह��, पर �\"ु�: �\"्ष�!त्र�9� पर ध्यान द�!ना �S़र�र६ ह��।",
      "readiness.lowFull": "ल�0न्�a स�! पहल�! महत्वप�र्ण �\"�प्लाय�स �\"ार्य � वश्य�\" ह��।",
      "empty.topPending.doneTitle": "सब प�रा ह�9 �या",
      "empty.topPending.doneDesc": "�!स समय �\"�9�� ल�बित � वश्य�\"ता नह६� ह��।",
      "empty.topPending.noneTitle": "�&भ६ �\"ु�: ल�बित नह६�",
      "empty.topPending.noneDesc": "प्राथमि�\"ता �\"तार बनान�! �\"�! लिए विश्ल�!षण �aलाएँ।",
      "empty.dashTl.doneTitle": "य�9�Sना �x्र���\" पर",
      "empty.dashTl.doneDesc": "� प�\"६ �\"ार्रवा�� य�9�Sना म�!� स�\"्रिय म६लstones ह���।",
      "empty.dashTl.noneTitle": "�&भ६ �\"�9�� �xा�!मला�!न नह६�",
      "empty.dashTl.noneDesc": "ल�0न्�a �xा�!मला�!न बनान�! �\"�! लिए विश्ल�!षण प�रा �\"र�!�।",
      "empty.watch.flagTitle": "�\"�9�� �aिह्नित बदलाव नह६�",
      "empty.watch.flagDesc": "�x्र���\" �\"िए �ए विनियम स्थिर ह���।",
      "empty.watch.noneTitle": "�&भ६ �\"ु�: �x्र���\" नह६� �\"िया �या",
      "empty.watch.noneDesc": "नियाम�\" बदलाव�9� �\"६ नि�रान६ �\"�! लिए बा�S़ार �x्र���\" �\"र�!�।",
      "empty.gaps": "�\"�9�� ���प नह६� मिला।",
      "empty.actions.doneTitle": "सभ६ �\"ार्रवा�!याँ प�र्ण",
      "empty.actions.doneDesc": "हर सुधार �aरण प�रा ह�9 �या ह��।",
      "empty.actions.noneTitle": "�&भ६ �\"�9�� �\"ार्रवा�� नह६�",
      "empty.actions.noneDesc": "विश्ल�!षण प�रा ह�9न�! �\"�! बाद �\"ार्रवा�!याँ बनत६ ह���।",
      "empty.costs.hasData": "ला�त �\"ा �&नुमान � प�\"�! ल�बित � �!�xम �र बा�S़ार प्र�9फ़ा�!ल स�! ल�ाया �Sाता ह��।",
      "empty.costs.none": "�\"�प्लाय�स ब�S�x �&नुमानित �\"रन�! �\"�! लिए विश्ल�!षण �aलाएँ।",
      "empty.updates.hasDataTitle": "ता�S़ा �&पड�!�x",
      "empty.updates.hasDataDesc": "� प�\"�! �x्र���\" �\"िए बा�S़ार�9� �\"�9 प्रभावित �\"रन�! वाल�! हालिया बदलाव।",
      "empty.updates.noneTitle": "�&भ६ �\"�9�� �&पड�!�x नह६�",
      "empty.updates.noneDesc": "�x्र���\" �\"िए �ए विनियम�9� �\"�! बदलन�! पर �&पड�!�x दि�त�! ह���।",
      "update.fallback": "�&पड�!�x",
      "empty.impact.hasDataTitle": "प्रभाव सारा�श",
      "empty.impact.hasDataDesc": "नियाम�\" बदलाव � प�\"�! व्यवसाय �\"�9 �\"��स�! प्रभावित �\"रत�! ह���।",
      "empty.impact.noneTitle": "�\"�9�� प्रभाव ड�!�xा नह६�",
      "empty.impact.noneDesc": "विनियम �x्र���\" �\"रन�! �\"�! बाद प्रभाव �&�तर्द॒ष्�xियाँ दि�त६ ह���।",
      "docs.emptyTitle": "�&भ६ �\"�9�� दस्ताव�!�S़ नह६�",
      "docs.emptyDesc": "ला�!स�!�स, प्रमाणपत्र �र �\"�प्लाय�स फ़ा�!ल�!� �&पल�9ड �\"र�!� �र सब ए�\" �S�ह र��!�।",
      "analyze.cta": "विश्ल�!षण �\"र�!�",
      "analyze.running": "विश्ल�!षण �Sार६⬦",
      "analyze.complete": "विश्ल�!षण प�रा हु� ",
      "err.title": "विश्ल�!षण प�रा नह६� ह�9 स�\"ा",
      "err.stage": "�aरण",
      "err.reason": "�\"ारण",
      "err.error": "त्रु�xि",
      "err.action": "सुझा�� ��� �\"ार्रवा��",
      "err.details": "विवरण",
      "err.retryBtn": "विश्ल�!षण फिर स�! �\"र�!�",
      "err.msg.SERVER_UNREACHABLE": "ReguLens सर्वर स�! स�पर्�\" नह६� ह�9 पा रहा। �&पना �\"न�!�\"्शन �Sाँ�a�!� �र फिर स�! �\"�9शिश �\"र�!�।",
      "err.msg.REQUEST_FAILED": "�&नुर�9ध �&प्रत्याशित र�प स�! विफल हु� । �\"॒पया फिर स�! प्रयास �\"र�!�।",
      "err.msg.AI_NOT_CONFIGURED": "�!स सर्वर पर AI �!��Sन �\"�0न्फ़ि�र नह६� ह��।",
      "err.msg.PROVIDER_AUTH_REJECTED": "AI प्रदाता न�! �!स सर्वर पर �\"�0न्फ़ि�र �\"िए �ए �\"्र�!ड�!�शियल �&स्व६�\"ार �\"र दिए।",
      "err.msg.PROVIDER_MODEL_UNAVAILABLE": "AI म�0डल �&स्थाय६ र�प स�! �0पलब्ध नह६� ह��। थ�9ड़६ द�!र म�!� फिर �\"�9शिश �\"र�!�।",
      "err.msg.RATE_LIMITED": "AI प्रदाता �\"६ दर स६मा पार ह�9 ���। थ�9ड़ा रु�\"�!� �र फिर �\"�9शिश �\"र�!�।",
      "err.msg.PROVIDER_ERROR": "AI प्रदाता न�! �&प्रत्याशित त्रु�xि द६।",
      "err.msg.PROVIDER_UNREACHABLE": "AI प्रदाता न�!�xवर्�\" त�\" नह६� पहुँ�aा �Sा स�\"ा।",
      "err.msg.MALFORMED_RESPONSE": "AI न�! ऐस६ प्रति�\"्रिया द६ �Sिस�! पार्स नह६� �\"िया �Sा स�\"ा।",
      "err.msg.STAGE_FAILED": "विश्ल�!षण �\"ा ए�\" �aरण विफल ह�9 �या।",
      "err.rec.PROVIDER_AUTH_REJECTED": "सर्वर �\"�0न्फ़ि�र�!शन म�!� AI प्रदाता �\"६ API �\"ु��S६ �Sाँ�a�!�।",
      "err.rec.PROVIDER_MODEL_UNAVAILABLE": "�\"ु�: मिन�x�9� म�!� फिर �\"�9शिश �\"र�!� या ड�!म�9 म�9ड पर �Sाएँ।",
      "err.rec.RATE_LIMITED": "ल�भ� ए�\" मिन�x प्रत६�\"्षा �\"र�!�, फिर 'विश्ल�!षण फिर स�! �\"र�!�' दबाएँ।",
      "err.rec.DEFAULT": "'विश्ल�!षण फिर स�! �\"र�!�' दबाएँ। बार-बार विफल ह�9न�! पर ड�!म�9 म�9ड पर �Sाएँ।",
      "validate.company": "�\"॒पया �&पन६ �\"�पन६ �\"ा नाम दर्�S �\"र�!�।",
      "validate.product": "�\"॒पया �&पना �0त्पाद या स�!वा बताएँ।",
      "validate.target": "�\"॒पया ल�\"्षित बा�S़ार �aुन�!�।",
      "validate.industry": "�\"॒पया �&पन६ �0द्य�9� श्र�!ण६ �aुन�!�।",
      "act.total": "�\"ुल �\"ार्रवा�!याँ",
      "act.critical": "��भ६र",
      "act.completed": "प�र्ण",
      "act.daysReady": "त��यार ह�9न�! म�!� दिन",
      "plan.total": "�\"ुल {d} दिन (~{w} सप्ताह)",
      "plan.criticalPath": "महत्वप�र्ण पथ: {p}",
      "plan.runToCompute": "ल�0न्�a य�9�Sना �णना �\"�! लिए विश्ल�!षण �aलाएँ।",
      "plan.actions": "{n} �\"ार्रवा�!याँ",
      "plan.dayRange": "दिन {a}�{b}",
      "dd.target": "ल�\"्षित बा�S़ार �aुन�!�⬦",
      "dd.industry": "�0द्य�9� श्र�!ण६ �aुन�!�⬦",
      "cmd.noMatch": "\u201C{q}\u201D स�! म�!ल �ात६ �\"�9�� �\"मा�ड नह६�",
      "industry.fintech": "फिन�x�!�\"",
      "industry.banking-financial": "ब����\"ि�� �र वित्त६य स�!वाएँ",
      "industry.healthcare": "स्वास्थ्य स�!वा",
      "industry.healthtech": "ह�!ल्थ�x�!�\"",
      "industry.edtech": "एड�x�!�\"",
      "industry.ecommerce": "��-�\"�0मर्स",
      "industry.saas": "SaaS",
      "industry.ai-ml": "AI �र मश६न लर्नि��",
      "industry.manufacturing": "विनिर्माण",
      "industry.retail": "�ुदरा",
      "industry.food-beverage": "�ाद्य �र प�!य",
      "industry.logistics": "ल�0�Sिस्�xि�\"्स �र � प�र्ति श्र॒��ला",
      "industry.energy": "�`र्�Sा",
      "industry.automotive": "��x�9म�9�xिव",
      "industry.telecommunications": "द�रस��aार",
      "industry.insurance": "ब६मा",
      "industry.pharmaceuticals": "फार्मास्य��xि�\"ल्स",
      "industry.travel-tourism": "यात्रा �र पर्य�xन",
      "industry.general": "सामान्य / �&न्य"
    },

    mr: {
      "nav.dashboard": "ड�&शब�9र्ड",
      "nav.canILaunch": "म६ ल�0न्�a �\"र� श�\"त�9 �\"ा?",
      "nav.agentIntel": "ए�S��x �!��x�!लि�Sन्स",
      "nav.requirements": "� वश्य�\"ता",
      "nav.gapAnalysis": "��&प विश्ल�!षण",
      "nav.actionPlan": "�\"॒त६ � रा�डा",
      "nav.costEstimator": "�र्�a �&�दा�S�\"",
      "nav.docLibrary": "दस्तऐव�S लायब्रर६",
      "nav.regWatch": "नियमन पहा",
      "nav.updates": "�&पड�!�x्स",
      "nav.impactAnalysis": "परिणाम विश्ल�!षण",
      "nav.group.analyze": "विश्ल�!षण",
      "nav.group.monitor": "निर६�\"्षण",
      "help.title": "मदत हव६ � ह�! �\"ा?",
      "help.text": "� म�a्या �\"�प्लायन्स त�S्�S्�~ाश६ ब�9ला",
      "help.book": "�\"�0ल बु�\" �\"रा",
      "crumb.marketReadiness": "बा�Sार तयार६",
      "crumb.settings": "स�!�xि��्�S",
      "crumb.profile": "प्र�9फा�!ल",
      "charts.empty": "दा�वण्यासाठ६ �&�S�न ड�!�xा नाह६.",
      "dashboard.totalRequirements": "ए�\"�ण � वश्य�\"ता",
      "dashboard.riskLevel": "ध�9�\"ा पातळ६",
      "dashboard.estimatedDays": "�&�दा�Sित दिवस",
      "dashboard.complianceProgress": "�\"�प्लायन्स प्र�त६",
      "cost.total": "ए�\"�ण �&�दा�Sित �र्�a",
      "gap.totalGaps": "�ुल�! ��&प",
      "gap.critical": "��भ६र",
      "gap.high": "�0�a्�a",
      "gap.medium": "मध्यम",
      "gap.low": "�\"म६",
      "req.statusCompleted": "प�र्ण",
      "req.statusInProgress": "प्र�त६पथावर",
      "req.statusPending": "प्रल�बित",
      "req.statusNA": "ला�� नाह६",
      "sev.critical": "��भ६र",
      "sev.high": "�0�a्�a",
      "sev.medium": "मध्यम",
      "sev.low": "�\"म६",
      "sev.info": "माहित६",
      "prio.high": "�0�a्�a प्राधान्य",
      "prio.medium": "मध्यम प्राधान्य",
      "prio.low": "�\"म६ प्राधान्य",
      "time.day": "दिवस",
      "time.days": "दिवस",
      "time.publishedOn": "{d} र�9�S६ प्र�\"ाशित",
      "time.more": "+� ण�६ {n}⬦",
      "common.update": "�&पड�!�x",
      "common.complete": "प�र्ण",
      "common.none": "�\"ाह६ नाह६",
      "common.viewDetails": "तपश६ल पहा",
      "reg.label": "नियम",
      "reg.kind.new": "नव६न नियम",
      "reg.kind.amendment": "दुरुस्त६",
      "reg.kind.update": "�&पड�!�x",
      "reg.kind.repeal": "रद्द",
      "reg.kind.guidance": "मार्�दर्शन",
      "stage.research": "बा�Sार स�श�9धन",
      "stage.requirements": "� वश्य�\"ता म�&पि��",
      "stage.gaps": "��&प विश्ल�!षण",
      "stage.risks": "ध�9�\"ा म�ल्यमापन",
      "stage.actions": "�\"॒त६ निय�9�Sन",
      "stage.readiness": "तयार६ स्�\"�9�&रि��",

      "agent.name.research": "स�श�9धन ए�S��x",
      "agent.name.requirements": "� वश्य�\"ता ए�S��x",
      "agent.name.gaps": "��&प ए�S��x",
      "agent.name.risk": "रिस्�\" ए�S��x",
      "agent.name.actions": "ॲ�\"्शन ए�S��x",
      "agent.purpose.research": "तुम�a्या �0त्पादनास ला�� ह�9�` श�\"णाऱ्या नियमा� �ळ�त�9",
      "agent.purpose.requirements": "नियमा��a�! म�र्त �\"�प्लायन्स � वश्य�\"ता�मध्य�! र�पा�तर �\"रत�9",
      "agent.purpose.gaps": "तुम�a्या � णि �\"�प्लायन्समध६ल �\"मतरता श�9धत�9",
      "agent.purpose.risk": "ल�0न्�a ध�9�\"ा � णि व्यवसाय परिणामा�a�! म�ल्यमापन �\"रत�9",
      "agent.purpose.actions": "प्राधान्य�\"्रमित �0पायय�9�Sना � रा�डा तयार �\"रत�9",
      "ai.byPriority": "प्राधान्यानुसार � वश्य�\"ता",
      "ai.bySeverity": "त६व्रत�!नुसार ��&प",
      "ai.countReqs": "{n} � वश्य�\"ता",
      "ai.countGaps": "{n} ��&प",
      "ai.more": "+� ण�६ {n}⬦",
      "ai.sum.research": "{n} स�भाव्य ला�� नियाम�\" स्र�9त �ळ�ल�!{extra}.",
      "ai.sum.reqs": "{n} �\"�प्लायन्स � वश्य�\"ता तयार झाल्या{extra}.",
      "ai.sum.gaps": "{n} �\"�प्लायन्स ��&प � ढळल�!{extra}.",
      "ai.sum.readiness": "तयार६ स्�\"�9�&र: {p}%{extra}",
      "ai.sum.readinessPlain": "बा�Sार तयार६ स्�\"�9�&र�a६ �णना झाल६.",
      "ai.sum.actions": "{n} प्राधान्य�\"्रमित �0पाय �\"॒त६ तयार झाल्या{extra}.",
      "ai.extra.highConf": " ({h} �0�a्�a-विश्वास)",
      "ai.extra.critical": " ({h} ��भ६र)",
      "ai.extra.highPrio": " ({h} �0�a्�a-प्राधान्य)",
      "ai.extra.risk": " · ध�9�\"ा पातळ६: {r}",
      "ai.extra.cost": " · �&�दा�Sित �र्�a: {c}",
      "verdict.noAnalysis": "ल�0न्�a नि�\"ाल मिळवण्यासाठ६ विश्ल�!षण �aालवा.",
      "verdict.prompt": "तुम्ह६ ल�0न्�aसाठ६ तयार � हात �\"ा ह�! पाहण्यासाठ६ �\"�पन६ � णि �0त्पादन तपश६ल �xा�\"ा.",
      "verdict.ready": "{m} मध्य�! {pr} ल�0न्�a �\"रण्यासाठ६ {c} {p}% तयार � ह�!.",
      "verdict.pendingLeft": "नियाम�\" ध�9�\"ा �\"म६ �\"रण्यासाठ६ बा�Sारात प्रव�!शाप�र्व६ �0र्वरित {n} प्रल�बित � वश्य�\"ता प�र्ण �\"रा.",
      "verdict.allDone": "सर्व � वश्य�\"ता प�र्ण झाल्या � तुम्ह६ पुढ�! �Sा�` श�\"ता.",
      "badge.ready": "ल�0न्�aसाठ६ तयार",
      "badge.conditions": "�&�x६�सह परवान�६",
      "badge.highrisk": "�0�a्�a ध�9�\"ा",
      "badge.notready": "तयार नाह६",
      "readiness.excellent": "�0त्�\"॒ष्�x",
      "readiness.moderate": "मध्यम",
      "readiness.low": "�\"म६",
      "readiness.excellentFull": "सर्व ��भ६र �\"्ष�!त्रा�मध्य�! बळ�\"�x नियाम�\" तयार६.",
      "readiness.moderateFull": "�aा��ला पाया � ह�!, पण �\"ाह६ �\"्ष�!त्रा��\"ड�! ल�\"्ष द�!ण�! � वश्य�\" � ह�!.",
      "readiness.lowFull": "ल�0न्�aप�र्व६ म�9ठ्या प्रमाणात �\"�प्लायन्स �\"ामा�a६ � वश्य�\"ता � ह�!.",
      "empty.topPending.doneTitle": "सर्व प�र्ण झाल�!",
      "empty.topPending.doneDesc": "सध्या �\"�9णत६ह६ प्रल�बित � वश्य�\"ता नाह६.",
      "empty.topPending.noneTitle": "�&�S�न �\"ाह६ प्रल�बित नाह६",
      "empty.topPending.noneDesc": "प्राधान्य रा�� तयार �\"रण्यासाठ६ विश्ल�!षण �aालवा.",
      "empty.dashTl.doneTitle": "� रा�डा मार्�ावर",
      "empty.dashTl.doneDesc": "तुम�a्या �\"॒त६ � रा�ड्यात स�\"्रिय �xप्प�! � ह�!त.",
      "empty.dashTl.noneTitle": "�&�S�न व�!ळपत्र�\" नाह६",
      "empty.dashTl.noneDesc": "ल�0न्�a व�!ळपत्र�\" बनवण्यासाठ६ विश्ल�!षण प�र्ण �\"रा.",
      "empty.watch.flagTitle": "�aिन्हा��\"ित बदल नाह६त",
      "empty.watch.flagDesc": "मा��9वा ���!तल�!ल�! नियम स्थिर � ह�!त.",
      "empty.watch.noneTitle": "�&�S�न �\"ाह६ मा��9वा ���!तल�!ला नाह६",
      "empty.watch.noneDesc": "नियाम�\" बदल पाहण्यासाठ६ बा�Sार मा��9वा ��्या.",
      "empty.gaps": "�\"�9णत�!ह६ ��&प � ढळल�! नाह६त.",
      "empty.actions.doneTitle": "सर्व �\"॒त६ प�र्ण",
      "empty.actions.doneDesc": "प्रत्य�!�\" �0पाय �xप्पा प�र्ण झाला � ह�!.",
      "empty.actions.noneTitle": "�&�S�न �\"॒त६ नाह६त",
      "empty.actions.noneDesc": "विश्ल�!षण प�र्ण झाल्यावर �\"॒त६ तयार ह�9तात.",
      "empty.costs.hasData": "�र्�aा�aा �&�दा�S तुम�a्या प्रल�बित बाब६ � णि बा�Sार प्र�9फा�!लवर�न लावला �Sात�9.",
      "empty.costs.none": "�\"�प्लायन्स �&�दा�Sपत्र�\" लावण्यासाठ६ विश्ल�!षण �aालवा.",
      "empty.updates.hasDataTitle": "ता�S्या �&पड�!�x्स",
      "empty.updates.hasDataDesc": "मा��9वा ���!तल�!ल्या बा�Sारा�ना परिणाम �\"रणार�! �&ल६�\"ड६ल बदल.",
      "empty.updates.noneTitle": "�&�S�न �&पड�!�x्स नाह६त",
      "empty.updates.noneDesc": "मा��9वा ���!तल�!ल�! नियम बदलल्यावर �&पड�!�x्स दिसतात.",
      "update.fallback": "�&पड�!�x",
      "empty.impact.hasDataTitle": "परिणाम � ढावा",
      "empty.impact.hasDataDesc": "नियाम�\" बदल तुम�a्या व्यवसायावर �\"सा परिणाम �\"रतात.",
      "empty.impact.noneTitle": "परिणाम ड�!�xा नाह६",
      "empty.impact.noneDesc": "नियम मा��9वा ���!तल्यावर परिणाम �&�तर्द॒ष्�x६ दिसत�!.",
      "docs.emptyTitle": "�&�S�न दस्तऐव�S नाह६त",
      "docs.emptyDesc": "परवान�!, प्रमाणपत्र�! � णि �\"�प्लायन्स फा�!ल्स �&पल�9ड �\"रा � णि सर्व ए�\"ा ठि�\"ाण६ ठ�!वा.",
      "analyze.cta": "विश्ल�!षण �\"रा",
      "analyze.running": "विश्ल�!षण सुर�⬦",
      "analyze.complete": "विश्ल�!षण प�र्ण झाल�!",
      "err.title": "विश्ल�!षण प�र्ण ह�9�` श�\"ल�! नाह६",
      "err.stage": "�xप्पा",
      "err.reason": "�\"ारण",
      "err.error": "त्रु�x६",
      "err.action": "शिफारस �\"�!ल�!ल६ �\"॒त६",
      "err.details": "तपश६ल",
      "err.retryBtn": "विश्ल�!षण पुन्हा �\"रा",
      "err.msg.SERVER_UNREACHABLE": "ReguLens सर्व्हरश६ स�पर्�\" ह�9त नाह६. तुम�a�! �\"न�!�\"्शन तपासा � णि पुन्हा प्रयत्न �\"रा.",
      "err.msg.REQUEST_FAILED": "विन�त६ �&नप�!�\"्षितपण�! �&यशस्व६ झाल६. �\"॒पया पुन्हा प्रयत्न �\"रा.",
      "err.msg.AI_NOT_CONFIGURED": "या सर्व्हरवर AI �!��Sिन �\"�0न्फि�र �\"�!ल�!ल�! नाह६.",
      "err.msg.PROVIDER_AUTH_REJECTED": "AI प्रदात्यान�! या सर्व्हरवर६ल �\"्र�!ड�!न्शियल्स ना�\"ारल६.",
      "err.msg.PROVIDER_MODEL_UNAVAILABLE": "AI म�0ड�!ल तात्पुरत�! �0पलब्ध नाह६. थ�9ड्या व�!ळान�! पुन्हा प्रयत्न �\"रा.",
      "err.msg.RATE_LIMITED": "AI प्रदात्या�a६ दरमर्यादा �ला�डल६ ��!ल६. था�बा � णि पुन्हा प्रयत्न �\"रा.",
      "err.msg.PROVIDER_ERROR": "AI प्रदात्या�\"ड�न �&नप�!�\"्षित त्रु�x६ � ल६.",
      "err.msg.PROVIDER_UNREACHABLE": "AI प्रदात्या�a्या न�!�xवर्�\"श६ �S�9डण६ झाल६ नाह६.",
      "err.msg.MALFORMED_RESPONSE": "AI न�! वा�aता य�!��ल �&श६ प्रति�\"्रिया दिल६ नाह६.",
      "err.msg.STAGE_FAILED": "विश्ल�!षणा�aा ए�\" �xप्पा �&यशस्व६ झाला.",
      "err.rec.PROVIDER_AUTH_REJECTED": "सर्व्हर �\"�0न्फि�र�!शनमध६ल AI प्रदात्या�a६ API �\"६ तपासा.",
      "err.rec.PROVIDER_MODEL_UNAVAILABLE": "�\"ाह६ मिनि�xा�त पुन्हा प्रयत्न �\"रा �\"ि�वा ड�!म�9 म�9डवर �Sा.",
      "err.rec.RATE_LIMITED": "सुमार�! ए�\" मिनि�x�! था�बा � णि 'विश्ल�!षण पुन्हा �\"रा' दाबा.",
      "err.rec.DEFAULT": "'विश्ल�!षण पुन्हा �\"रा' दाबा. सतत �&यशस्व६ झाल्यास ड�!म�9 म�9डवर �Sा.",
      "validate.company": "�\"॒पया तुम�a्या �\"�पन६�a�! नाव �xा�\"ा.",
      "validate.product": "�\"॒पया तुम�a�! �0त्पादन �\"ि�वा स�!वा वर्णन �\"रा.",
      "validate.target": "�\"॒पया ल�\"्ष्य बा�Sार निवडा.",
      "validate.industry": "�\"॒पया तुम�aा �0द्य�9� निवडा.",
      "act.total": "ए�\"�ण �\"॒त६",
      "act.critical": "��भ६र",
      "act.completed": "प�र्ण",
      "act.daysReady": "तयार ह�9ण्यास दिवस",
      "plan.total": "ए�\"�ण {d} दिवस (~{w} � ठवड�!)",
      "plan.criticalPath": "महत्त्वा�aा मार्�: {p}",
      "plan.runToCompute": "ल�0न्�a � रा�डा म�9�Sण्यासाठ६ विश्ल�!षण �aालवा.",
      "plan.actions": "{n} �\"॒त६",
      "plan.dayRange": "दिवस {a}�{b}",
      "dd.target": "ल�\"्ष्य बा�Sार निवडा⬦",
      "dd.industry": "�0द्य�9� निवडा⬦",
      "cmd.noMatch": "\u201C{q}\u201D श६ �Sुळणार६ �\"�9णत६ह६ � �S्�~ा नाह६",
      "industry.fintech": "फिन�x�!�\"",
      "industry.banking-financial": "बँ�\"ि�� � णि वित्त६य स�!वा",
      "industry.healthcare": "� र�9�्य स�!वा",
      "industry.healthtech": "ह�!ल्थ�x�!�\"",
      "industry.edtech": "एड�x�!�\"",
      "industry.ecommerce": "�!-�\"�0मर्स",
      "industry.saas": "SaaS",
      "industry.ai-ml": "AI � णि मश६न लर्नि��",
      "industry.manufacturing": "�0त्पादन",
      "industry.retail": "�\"िर�\"�9ळ वि�\"्र६",
      "industry.food-beverage": "�&न्न � णि प�!य",
      "industry.logistics": "ल�0�Sिस्�xि�\"्स � णि पुरवठा सा�ळ६",
      "industry.energy": "�`र्�Sा",
      "industry.automotive": "��x�9म�9�xिव्ह",
      "industry.telecommunications": "द�रस��aार",
      "industry.insurance": "विमा",
      "industry.pharmaceuticals": "फार्मास्यु�xि�\"ल्स",
      "industry.travel-tourism": "प्रवास � णि पर्य�xन",
      "industry.general": "सामान्य / �!तर"
    }
  };
})();
