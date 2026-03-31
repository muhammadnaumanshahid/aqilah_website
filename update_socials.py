import os
import glob

# Files to update
files = glob.glob('*.html')
files.append('script.js')

# Replacements mapping
replacements = {
    'https://www.facebook.com/profile.php?id=61577781420691': 'https://www.facebook.com/people/Home-with-Aqilah/61577781420691/',
    'https://instagram.com/home.withaqilah': 'https://www.instagram.com/home.withaqilah',
    'https://youtube.com/@homewithaqilah': 'https://www.youtube.com/@homewithaqilah'
}

for filepath in files:
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            content = f.read()
            
        modified = False
        for old_link, new_link in replacements.items():
            if old_link in content:
                content = content.replace(old_link, new_link)
                modified = True
                
        if modified:
            with open(filepath, 'w') as f:
                f.write(content)
            print(f"Updated {filepath}")

print("Social links updated successfully.")
