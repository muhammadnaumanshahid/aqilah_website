import os
import subprocess

images = [
    "https://homewithaqilah.com/wp-content/uploads/2026/02/portfolio-yishun-ring-road-2-1024x754.webp",
    "https://homewithaqilah.com/wp-content/uploads/2026/02/portfolio-yishun-ring-road-9-768x542.webp",
    "https://homewithaqilah.com/wp-content/uploads/2026/02/portfolio-yishun-ring-road-8-768x515.webp",
    "https://homewithaqilah.com/wp-content/uploads/2026/02/portfolio-yishun-ring-road-7-768x512.jpg",
    "https://homewithaqilah.com/wp-content/uploads/2026/02/portfolio-yishun-ring-road-6-768x491.jpg",
    "https://homewithaqilah.com/wp-content/uploads/2026/02/portfolio-yishun-ring-road-5-768x543.jpg",
    "https://homewithaqilah.com/wp-content/uploads/2026/02/portfolio-yishun-ring-road-4-768x488.webp",
    "https://homewithaqilah.com/wp-content/uploads/2026/02/portfolio-yishun-ring-road-11-768x492.webp",
    "https://homewithaqilah.com/wp-content/uploads/2025/12/portfolio-avenue-south-residence-5-2048x1366.webp",
    "https://homewithaqilah.com/wp-content/uploads/2025/12/portfolio-664-yishun-8-2048x1365.webp",
    "https://homewithaqilah.com/wp-content/uploads/2025/08/home-living-room-1-scaled.webp",
    "https://homewithaqilah.com/wp-content/uploads/2025/08/home-living-room-3.jpg",
    "https://homewithaqilah.com/wp-content/uploads/2025/08/services-styling-scaled.jpg",
    "https://homewithaqilah.com/wp-content/uploads/2026/02/portfolio-pinnacle-duxton-9-838x1024.webp",
    "https://homewithaqilah.com/wp-content/uploads/2026/02/portfolio-pinnacle-duxton-10-768x512.webp",
    "https://homewithaqilah.com/wp-content/uploads/2026/02/portfolio-pinnacle-duxton-4-768x512.jpg",
    "https://homewithaqilah.com/wp-content/uploads/2026/02/portfolio-pinnacle-duxton-2-768x482.webp",
    "https://homewithaqilah.com/wp-content/uploads/2026/02/portfolio-pinnacle-duxton-3-768x482.jpg",
    "https://homewithaqilah.com/wp-content/uploads/2026/02/portfolio-664-yishun-2-731x1024.webp",
    "https://homewithaqilah.com/wp-content/uploads/2026/02/portfolio-664-yishun-24-768x1152.webp",
    "https://homewithaqilah.com/wp-content/uploads/2026/02/portfolio-664-yishun-23-768x1152.webp",
    "https://homewithaqilah.com/wp-content/uploads/2026/02/portfolio-664-yishun-21-768x1152.webp",
    "https://homewithaqilah.com/wp-content/uploads/2026/02/portfolio-664-yishun-18-768x1152.webp",
    "https://homewithaqilah.com/wp-content/uploads/2026/02/portfolio-664-yishun-10-768x1152.webp",
    "https://homewithaqilah.com/wp-content/uploads/2026/02/portfolio-yishun-ring-road-1-768x464.jpg"
]

images_dir = "images"
if not os.path.exists(images_dir):
    os.makedirs(images_dir)

for url in images:
    filename = url.split('/')[-1]
    filepath = os.path.join(images_dir, filename)
    print(f"Downloading {filename}...")
    subprocess.call([
        "curl", "-skL", 
        "-H", "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "-H", "Referer: https://homewithaqilah.com/",
        url, "-o", filepath
    ])

print("All images downloaded successfully.")
