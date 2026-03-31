import zipfile
import re

file_path = '/Users/muhammadnaumanshahid/Downloads/homewithaqilah.com/Web Pages/Web Pages.pages'

def extract_text_from_pages(filepath):
    text = ""
    try:
        with zipfile.ZipFile(filepath, 'r') as zf:
            # Newer Pages format
            if 'Index/Document.iwa' in zf.namelist():
                return "The format is modern .pages (IWA format) which is binary. Cannot parse easily via zipfile."
            # Older format
            elif 'index.xml' in zf.namelist():
                xml_content = zf.read('index.xml').decode('utf-8')
                text = re.sub('<[^<]+>', ' ', xml_content)
                text = re.sub(r'\s+', ' ', text).strip()
    except Exception as e:
        return f"Error: {e}"
    return text

print(extract_text_from_pages(file_path))
