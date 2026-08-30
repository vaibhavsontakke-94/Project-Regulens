import re

with open('public/app.js', 'r', encoding='latin1') as f:
    c = f.read()

old = "if (els.verdictText) {\n      els.verdictText.textContent = !hasData\n        ? \"Enter your company, product and target market above to generate a launch-readiness analysis.\"\n        : analysisData.company + \" is \" + readiness + \"% ready to launch \" + analysisData.product + \" in \" +\n          analysisData.target +\n            \". \" + (s.pending > 0 ? \"Resolve the \" + s.pending + \" pending requirements before entering the market to reduce compliance risk.\" : \"All requirements are addressed — you are ready to proceed.\");\n    }"

repl = "if (els.verdictText) {\n      els.verdictText.textContent = !hasData\n        ? \"Start business registration to generate analysis.\"\n        : hasData ? \"Business registered and verified\" : \"Complete your business profile for readiness assessment\";\n    }"

print("Old length:", len(old))
print("New length:", len(repl))
print("Old in c:", old in c)

if old in c:
    print('Pattern found, replacing...')
    c = c.replace(old, repl)
    with open('public/app.js', 'w', encoding='latin1') as f:
        f.write(c)
    print('Replaced successfully')
else:
    print('Pattern not found directly')
    # Try to find verdictText
    idx = c.find('els.verdictText')
    if idx > 0:
        print('Found els.verdictText at', idx)
        # Print surrounding context
        print(c[idx-100:idx+500])
    else:
        print('els.verdictText not found at all')