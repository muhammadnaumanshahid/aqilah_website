# Home with Aqilah | Premium Interior Design Portfolio

Welcome to the **Home with Aqilah** website repository! This is a lightning-fast, highly responsive, and conversion-optimized digital portfolio built for an interior design practice.

## 🌟 Overview
Built with pure HTML, CSS, and vanilla JavaScript, this project bypasses heavy CMS constraints to deliver incredibly fast load times and a deeply tactile user experience. It's designed to act as a **trust engine**—funneling prospective clients from browsing stunning project galleries directly into a consultation waitlist.

## ✨ Features
- **Immersive Mobile Menu:** A glassmorphism full-screen overlay for elegant mobile navigation.
- **Conversion Drivers:** A sticky floating action button (FAB) that locks the "Book Consultation" action in the user's peripheral vision.
- **Intersection Animation:** Scroll-based dynamic elements that gently reveal themselves to craft a tactile storytelling experience.
- **Secure Form Routing:** Native integration with Formspree (utilizing hidden honeypot logic to automatically terminate bot spam).
- **Extreme Responsiveness:** Fully fluid layouts scaling from 4K ultra-wide monitors down to 320px mobile screens without breaking.

## 🚀 How to Run Locally
Because this project utilizes pure web standards, no heavy dependencies are required. 

1. Clone the repository: `git clone https://github.com/muhammadnaumanshahid/aqilah_website.git`
2. Navigate to the project folder: `cd aqilah_website`
3. Spin up a local Python server: 
   ```bash
   python3 -m http.server 8042
   ```
4. Open your browser and go to `http://localhost:8042`.

## 🛠️ Adding New Projects
To expand the portfolio, follow the simple copy-paste protocol:
1. Place new high-resolution images into the `/images` directory.
2. Duplicate an existing HTML project file (e.g., `project-duxton.html`) and rename it (`project-[new-name].html`).
3. Update the `<title>`, heading, and `<img src="...">` tags inside your new file.
4. Link your new HTML file in `portfolio.html`!

## 🔐 Security & Optimization
- **Reverse-Tabnabbing Protected:** All external and social media targets utilize `rel="noopener noreferrer"`.
- **A11y (Accessibility):** All interactive inputs and anchors possess keyboard-supported `:focus-visible` styling for inclusive navigation.

---
*(c) 2026 Home with Aqilah. All rights reserved.*
