with open('public/app.js', 'r', encoding='latin1') as f:
    c = f.read()

key_terms = ['company', 'product', 'target', 'market', 'ready', 'analysis', 'launch', 'verdict']
for term in key_terms:
    lower_c = c.lower()
    idx = lower_c.find(term)
    if idx >= 0:
        print(f"'{term}': first at {idx}, context: {c[max(0,idx-20):idx+80]}")
    else:
        print(f"'{term}': not found")