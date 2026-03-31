import os
import glob
import re
import difflib

# Find all HTML files
html_files = glob.glob('*.html')
img_base = '/Users/muhammadnaumanshahid/.gemini/antigravity/scratch/aqilah_website/'

def get_all_real_images():
    real_images = []
    # walk through images/ directory
    for root, dirs, files in os.walk(os.path.join(img_base, 'images')):
        for file in files:
            if file.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                rel_path = os.path.relpath(os.path.join(root, file), img_base)
                real_images.append(rel_path)
    return real_images

real_images = get_all_real_images()

total_fixed = 0

for filepath in html_files:
    with open(filepath, 'r') as f:
        html = f.read()
    
    # regex to find src="..." and url('...')
    src_pattern = r'src="([^"]+)"'
    url_pattern = r'url\([\'"]?([^\'"\)]+)[\'"]?\)'
    
    all_links = re.findall(src_pattern, html) + re.findall(url_pattern, html)
    
    # Filter for image links
    img_links = [l for l in all_links if l.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
    
    new_html = html
    for link in img_links:
        full_link_path = os.path.join(img_base, link)
        if not os.path.exists(full_link_path):
            print(f"BROKEN: {link} in {filepath}")
            
            # Attempt auto-fix: extract the filename and search the real images
            broken_basename = os.path.basename(link)
            
            # Find the best match in the entire real_images array based on basename
            real_basenames = [os.path.basename(r) for r in real_images]
            matches = difflib.get_close_matches(broken_basename, real_basenames, n=1, cutoff=0.5)
            
            if matches:
                matched_basename = matches[0]
                # Find the full relative path of this matched basename
                correct_rel_path = next(r for r in real_images if os.path.basename(r) == matched_basename)
                
                print(f"  -> Auto-fixing to: {correct_rel_path}")
                new_html = new_html.replace(link, correct_rel_path)
                total_fixed += 1
            else:
                print(f"  -> FAIL: Could not find any close match for {broken_basename}")
    
    if new_html != html:
        with open(filepath, 'w') as f:
            f.write(new_html)

print(f"Total broken links fixed securely: {total_fixed}")
