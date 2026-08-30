import re

with open('public/app.js', 'r', encoding='latin1') as f:
    c = f.read()

print("File size:", len(c))
print("First 200 chars:", c[:200])
print("---")
# Try to find any of the key terms from the earlier PowerShell output
key_terms = ['company', 'product', 'target', 'market', 'ready', 'analysis', 'launch', 'verdict']
for term in key_terms:
    # Case-insensitive search
    indices = [i for i in range(len(c)-1) if c[i:i+len(term)].lower() == term.lower()]
    if indices:
        print(f"'{term}': found at {len(indices)} positions, first at {indices[0]}")