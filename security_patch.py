import os
import glob

html_files = glob.glob('*.html')

# 1. Update target="_blank" safety
for file in html_files:
    with open(file, 'r') as f:
        content = f.read()
    
    # Simple replacement: target="_blank" to target="_blank" rel="noopener noreferrer"
    content = content.replace('target="_blank"', 'target="_blank" rel="noopener noreferrer"')
    
    with open(file, 'w') as f:
        f.write(content)

# 2. Inject honeypot into index.html form
with open('index.html', 'r') as f:
    index_content = f.read()

if 'name="_gotcha"' not in index_content:
    form_tag = '<form id="enquiry-form" action="https://formspree.io/f/info@homewithaqilah.com" method="POST">'
    gotcha_tag = form_tag + '\n                        <input type="text" name="_gotcha" style="display:none" />'
    index_content = index_content.replace(form_tag, gotcha_tag)
    
    with open('index.html', 'w') as f:
        f.write(index_content)

print("Security updates applied.")
