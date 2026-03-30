import subprocess
import re
import json
import urllib.parse

url = "https://homewithaqilah.com/"
try:
    html = subprocess.check_output(['curl', '-skL', url]).decode('utf-8', errors='ignore')
    
    # Extract image tags
    imgs = set(re.findall(r'<img[^>]+src="([^">]+)"', html))
    img_urls = []
    for img in imgs:
        if img.startswith('/'):
            img_urls.append(urllib.parse.urljoin(url, img))
        elif 'homewithaqilah.com' in img:
            img_urls.append(img)
            
    # Extract links
    links = set(re.findall(r'<a[^>]+href="([^">]+)"', html))
    project_links = []
    for link in links:
        if 'project' in link.lower() or 'portfolio' in link.lower() or '/portfolio' in link.lower():
            if link.startswith('/'):
               project_links.append(urllib.parse.urljoin(url, link))
            elif 'homewithaqilah.com' in link:
               project_links.append(link)
               
    data = {
        "images": list(set(img_urls)),
        "projects": list(set(project_links))
    }
    print(json.dumps(data, indent=2))
except Exception as e:
    print(json.dumps({"error": str(e)}))
