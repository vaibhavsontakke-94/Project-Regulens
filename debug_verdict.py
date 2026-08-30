import re

with open('public/app.js', 'r', encoding='latin1') as f:
    c = f.read()

# Search for verdictText
idx = c.find('verdictText')
print('verdictText index:', idx)

if idx > 0:
    # Print surrounding context - 300 chars before and after
    start = max(0, idx - 200)
    end = min(len(c), idx + 500)
    print('Context:')
    print(c[start:end])
    
    # Also search for the specific text patterns
    idx2 = c.find('Enter your company')
    print('Enter your company at:', idx2)
    
    idx3 = c.find('Start business registration')
    print('Start business at:', idx3)