import os
import shutil
import glob
import re
import zipfile
import xml.etree.ElementTree as ET

BASE_SRC = '/Users/muhammadnaumanshahid/Downloads/homewithaqilah.com/Images/Projects/'
BASE_DEST = '/Users/muhammadnaumanshahid/.gemini/antigravity/scratch/aqilah_website/images/'

PROJECT_MAP = {
    '654_Hougang_Modern': 'Hougang',
    'Oriental_Interior_Avenue_South': 'Oriental_Avenue',
    'Pinnacle_Duxton_Modern_Contemporary': 'Duxton',
    '664_Yishun_Modern_Classic': 'Yishun_Classic',
    '618_Yishun_Ring_Road_Modern_Contemporary': 'Yishun_Contemporary'
}

def clean_dest_img_folders():
    # Make sure subdirectories exist
    for src_dir, dest_name in PROJECT_MAP.items():
        dest_path = os.path.join(BASE_DEST, dest_name)
        os.makedirs(dest_path, exist_ok=True)

def migrate_images():
    for src_dir, dest_name in PROJECT_MAP.items():
        full_src = os.path.join(BASE_SRC, src_dir)
        dest_path = os.path.join(BASE_DEST, dest_name)
        
        # Hougang has an internal 'Images' folder
        if src_dir == '654_Hougang_Modern':
            full_src = os.path.join(full_src, 'Images')
        
        if os.path.isdir(full_src):
            for file in os.listdir(full_src):
                if file.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                    src_file = os.path.join(full_src, file)
                    dest_file = os.path.join(dest_path, file)
                    shutil.copy2(src_file, dest_file)
            print(f"Migrated photos to {dest_name}/")

def remove_loose_duplicates():
    # To prevent broken links on the main site (e.g. index.html hero image), 
    # we should ONLY remove duplicate loose files that have been successfully copied to subfolders.
    # Actually, the user said "all photos must be within the images folder and subfolders and not everywhere within the main" 
    # Meaning they want ALL loose project photos cleared from `images/`.
    
    # Gather ALL image filenames that now exist down inside the new subfolders:
    subfolder_images = set()
    for dest_name in PROJECT_MAP.values():
        path = os.path.join(BASE_DEST, dest_name)
        for f in os.listdir(path):
            if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                subfolder_images.add(f)
                
    # If any of those exact filenames exist loose in `images/`, delete them.
    loose_files = os.listdir(BASE_DEST)
    deleted_count = 0
    for file in loose_files:
        if file in subfolder_images and os.path.isfile(os.path.join(BASE_DEST, file)):
            os.remove(os.path.join(BASE_DEST, file))
            deleted_count += 1
    print(f"Deleted {deleted_count} duplicate loose photos from root images/")

def extract_hougang_text():
    docx_path = os.path.join(BASE_SRC, '654_Hougang_Modern', 'Write up-654 Hougang.docx')
    text = ""
    try:
        with zipfile.ZipFile(docx_path) as docx:
            xml_content = docx.read('word/document.xml')
            tree = ET.XML(xml_content)
            # The namespace prefix used in docx xml 
            WORD_NAMESPACE = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
            paragraphs = []
            for paragraph in tree.iter(WORD_NAMESPACE + 'p'):
                texts = [node.text for node in paragraph.iter(WORD_NAMESPACE + 't') if node.text]
                if texts:
                    paragraphs.append(''.join(texts))
            text = '\n'.join(paragraphs)
            return text
    except Exception as e:
        return f"Could not extract docx text: {e}"

def update_existing_html_paths():
    # We must append the new subfolder paths to the image source tags in existing html files
    # E.g., src="images/portfolio-pinnacle-duxton-9.webp" -> src="images/Duxton/portfolio-pinnacle-duxton-9.webp"
    
    mappings = {
        'project-duxton.html': ('images/portfolio-pinnacle', 'images/Duxton/portfolio-pinnacle'),
        'project-yishun-classic.html': ('images/portfolio-664', 'images/Yishun_Classic/portfolio-664'),
        'project-yishun-contemporary.html': ('images/portfolio-yishun-ring-road', 'images/Yishun_Contemporary/portfolio-yishun-ring-road')
    }
    
    base_dir = '/Users/muhammadnaumanshahid/.gemini/antigravity/scratch/aqilah_website/'
    for file, (old_path, new_path) in mappings.items():
        filepath = os.path.join(base_dir, file)
        try:
            with open(filepath, 'r') as f:
                html = f.read()
            html = html.replace(old_path, new_path)
            with open(filepath, 'w') as f:
                f.write(html)
            print(f"Rewrote image paths in {file}")
        except FileNotFoundError:
            print(f"File {file} not found")

if __name__ == '__main__':
    clean_dest_img_folders()
    migrate_images()
    remove_loose_duplicates()
    hougang_text = extract_hougang_text()
    print("\n--- Hougang Raw Narrative ---")
    print(hougang_text)
    print("-----------------------------\n")
    update_existing_html_paths()
