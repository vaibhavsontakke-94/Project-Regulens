with open('C:\Users\vaibh\Documents\Project Regulens\public\style.css', 'r', encoding='utf8') as f:
    content = f.read()

# Replace line 3-4 header
content = content.replace(
    'Bright day mode \u2022 Matte-black night mode \u2022 Micro-interactions', 
    'Day mode \u2022 Micro-interactions'
)

with open('C:\Users\vaibh\Documents\Project Regulens\public\style.css', 'w', encoding='utf8') as f:
    f.write(content)

print("Header updated")