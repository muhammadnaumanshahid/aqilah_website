import os
import glob

# Files to update
files = glob.glob('*.html')

# Replacements mapping specifically for the top navbar placeholders
replacements = {
    'href="#" aria-label="Facebook"': 'href="https://www.facebook.com/people/Home-with-Aqilah/61577781420691/" target="_blank" rel="noopener noreferrer" aria-label="Facebook"',
    'href="#" aria-label="Instagram"': 'href="https://www.instagram.com/home.withaqilah" target="_blank" rel="noopener noreferrer" aria-label="Instagram"',
    'href="#" aria-label="YouTube"': 'href="https://www.youtube.com/@homewithaqilah" target="_blank" rel="noopener noreferrer" aria-label="YouTube"'
}

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()
        
    modified = False
    for old_text, new_text in replacements.items():
        if old_text in content:
            content = content.replace(old_text, new_text)
            modified = True
            
    if modified:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated nav placeholders in {filepath}")

print("Navigation social links updated successfully.")
