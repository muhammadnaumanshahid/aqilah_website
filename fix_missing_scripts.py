import os
import glob
import re

html_files = glob.glob('*.html')
script_tag = '    <script src="script.js"></script>\n'

for filepath in html_files:
    with open(filepath, 'r') as f:
        content = f.read()
        
    if '<script src="script.js"></script>' not in content:
        # Inject script right before </body>
        new_content = re.sub(r'</body>', script_tag + '</body>', content)
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Injected script.js into {filepath}")
    else:
        print(f"{filepath} already has script.js")
