import re

with open('public/app.js', 'r', encoding='latin1') as f:
    c = f.read()

# Search for launch-related, readiness, analysis patterns
for pattern in ['launch-readiness', 'launchReadiness', 'READY', 'READY_WITH', 'canLaunch', 'verdictBadge', 'verdictReasons', 'verdictRing', 'verdictValue', 'verdictTitle']:
    idx = c.find(pattern)
    print(f'{pattern}: index={idx}')

# Search for the analysis data generation section
for pattern in ['getAnalysisStats', 'analysisData', 'renderVerdict', 's.pending', 's.readiness']:
    idx = c.find(pattern)
    print(f'{pattern}: index={idx}')