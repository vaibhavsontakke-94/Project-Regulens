import re

with open('public/app.js', 'r', encoding='latin1') as f:
    c = f.read()

# Search various patterns
for pattern in ['VerdictText', 'verdictText', 'verdicttext', 'Verdicttext', 'verdict_TEXT', 'verdict_text']:
    idx = c.find(pattern)
    print(f'{pattern}: index={idx}')

# Also try regex
import re
matches = re.findall(r'verdict.{0,50}', c, re.IGNORECASE)
print('\nRegex matches (first 10):')
for m in matches[:10]:
    print('  ', m)