import * as grok from './lib/groq.js';
console.log('AI configured:', grok.isConfigured());
console.log('Model:', grok.model());
console.log('configuredInfo:', grok.configuredInfo());