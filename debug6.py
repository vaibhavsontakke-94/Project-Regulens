with open('public/app.js', 'r', encoding='latin1') as f:
    c = f.read()

# Check if there are ANY ASCII letters
ascii_letters = sum(1 for ch in c if ch.isalpha())
print("ASCII letters count:", ascii_letters)
print("Total chars:", len(c))
print("First 500 chars repr:", repr(c[:500][:200]))