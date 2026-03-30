import os
import glob

# Files to process
html_files = glob.glob('*.html')
css_file = 'style.css'

header_old_1 = '''    <header class="navbar-centered" id="navbar">
        <a href="index.html" class="logo-top"><img src="images/logo.jpg" alt="Home with Aqilah"></a>
        <nav>'''

header_old_2 = '''    <header class="navbar-centered scrolled" id="navbar">
        <a href="index.html" class="logo-top"><img src="images/logo.jpg" alt="Home with Aqilah"></a>
        <nav>'''

header_new_1 = '''    <header class="navbar" id="navbar">
        <a href="index.html" class="logo" style="display: flex; align-items: center; gap: 0.8rem;">
            <img src="images/logo.jpg" alt="Home with Aqilah" style="height: 32px; border-radius: 2px;">
            <span>HOME WITH <span class="accent">AQILAH</span></span>
        </a>
        <nav>'''

header_new_2 = '''    <header class="navbar scrolled" id="navbar">
        <a href="index.html" class="logo" style="display: flex; align-items: center; gap: 0.8rem;">
            <img src="images/logo.jpg" alt="Home with Aqilah" style="height: 32px; border-radius: 2px;">
            <span>HOME WITH <span class="accent">AQILAH</span></span>
        </a>
        <nav>'''

footer_old = '''<div class="footer-logo">HOME WITH <span class="accent">AQILAH</span></div>'''
footer_new = '''<div class="footer-logo">
                <img src="images/logo.jpg" alt="Home with Aqilah" style="height: 60px; margin: 0 auto 1rem; border-radius: 2px; display: block;">
                HOME WITH <span class="accent">AQILAH</span>
            </div>'''
            
footer_old_2 = '''<div class="container footer-content">
            <p>&copy; 2026 Home with Aqilah.</p>
        </div>'''
footer_new_2 = '''<div class="container footer-content">
            <div class="footer-logo" style="text-align:center; margin-bottom: 1rem;">
                <img src="images/logo.jpg" alt="Home with Aqilah" style="height: 40px; margin: 0 auto 1rem; border-radius: 2px; display: block;">
                HOME WITH <span class="accent">AQILAH</span>
            </div>
            <p>&copy; 2026 Home with Aqilah. Timeless design for intentional living.</p>
        </div>'''

for file in html_files:
    with open(file, 'r') as f:
        content = f.read()
    
    content = content.replace(header_old_1, header_new_1)
    content = content.replace(header_old_2, header_new_2)
    content = content.replace(footer_old, footer_new)
    
    if file != 'index.html':
        content = content.replace(footer_old_2, footer_new_2)
        
    with open(file, 'w') as f:
        f.write(content)

with open(css_file, 'r') as f:
    css_content = f.read()

# remove navbar-centered 
css_content = css_content.replace('.navbar-centered', '.navbar-REMOVED')
css_content = css_content.replace('.logo-top', '.logo-REMOVED')

with open(css_file, 'w') as f:
    f.write(css_content)

print("Updates complete.")
