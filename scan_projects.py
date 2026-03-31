import os
import glob

base_path = '/Users/muhammadnaumanshahid/Downloads/homewithaqilah.com/Images/Projects/'
folders = os.listdir(base_path)

summary = {}
for folder in folders:
    folder_path = os.path.join(base_path, folder)
    if os.path.isdir(folder_path):
        images = [f for f in os.listdir(folder_path) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
        summary[folder] = images

for folder, imgs in summary.items():
    print(f"[{folder}] - {len(imgs)} photos")
    # print up to 3 image names for context
    print("   Example:", imgs[:3] if len(imgs) > 0 else "None")
