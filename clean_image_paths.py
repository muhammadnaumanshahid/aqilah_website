import re
import os
import glob

html_files = glob.glob('*.html')

for filepath in html_files:
    with open(filepath, 'r') as f:
        html = f.read()
    
    # Remove dimension tags carefully (e.g. -838x1024)
    # Match: hyphen, digits, 'x', digits, immediately followed by .webp or .jpg
    pattern = r'-\d+x\d+(?=\.webp|\.jpg)'
    new_html = re.sub(pattern, '', html)
    
    # Fix the index.html pointers that we discovered:
    if filepath == 'index.html':
        new_html = new_html.replace('images/portfolio-pinnacle', 'images/Duxton/portfolio-pinnacle')
        new_html = new_html.replace('images/portfolio-664-yishun', 'images/Yishun_Classic/portfolio-664-yishun')
        new_html = new_html.replace('images/portfolio-yishun-ring-road', 'images/Yishun_Contemporary/portfolio-yishun-ring-road')
        
    if html != new_html:
        with open(filepath, 'w') as f:
            f.write(new_html)
        print(f"Fixed image paths in {filepath}")

# Now securely delete ALL loose portfolio images from the root images/ folder
img_dir = 'images/'
loose_projects = [f for f in os.listdir(img_dir) if f.startswith('portfolio-') and os.path.isfile(os.path.join(img_dir, f))]
for f in loose_projects:
    os.remove(os.path.join(img_dir, f))
print(f"Deleted {len(loose_projects)} loose portfolio images from images/ root.")
