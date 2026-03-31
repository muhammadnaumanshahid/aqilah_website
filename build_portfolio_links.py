import re
import os

def create_case_study(title, subtitle, hero_img, meta, challenge, solution, gallery, testimonial, client):
    return f"""
    <!-- 1. The Hero Space (The Hook) -->
    <section class="project-hero" style="background-image: url('{hero_img}');">
        <div class="project-hero-content scroll-animate">
            <h1 style="font-family: var(--font-heading); font-weight: 400;">{title}</h1>
            <p style="font-size: 1.2rem; letter-spacing: 2px; text-transform: uppercase; opacity: 0.9;">{subtitle}</p>
        </div>
    </section>

    <main class="container">
        <!-- 2. Metadata Analytics -->
        <div class="project-meta scroll-animate delay-1">
            <div class="meta-item">
                <span class="meta-label">Scope</span>
                <span class="meta-value">{meta['scope']}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Style</span>
                <span class="meta-value">{meta['style']}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Location</span>
                <span class="meta-value">{meta['location']}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Timeline</span>
                <span class="meta-value">{meta['timeline']}</span>
            </div>
        </div>

        <!-- 3. The Narrative (Brief vs Solution) -->
        <section class="project-narrative">
            <div class="narrative-block scroll-animate">
                <h3>The Challenge</h3>
                <p>{challenge}</p>
            </div>
            <div class="narrative-block scroll-animate delay-1">
                <h3>The Solution</h3>
                <p>{solution}</p>
            </div>
        </section>

        <!-- 4. Curated Gallery -->
        <section class="curated-gallery">
            <div class="gallery-item scroll-animate">
                <img src="{gallery[0]['img']}" alt="{title} Image 1">
                <p class="micro-caption">{gallery[0]['caption']}</p>
            </div>
            <div class="gallery-item scroll-animate delay-1">
                <img src="{gallery[1]['img']}" alt="{title} Image 2">
                <p class="micro-caption">{gallery[1]['caption']}</p>
            </div>
            <div class="gallery-item scroll-animate">
                <img src="{gallery[2]['img']}" alt="{title} Image 3">
                <p class="micro-caption">{gallery[2]['caption']}</p>
            </div>
            <div class="gallery-item scroll-animate delay-1">
                <img src="{gallery[3]['img']}" alt="{title} Image 4">
                <p class="micro-caption">{gallery[3]['caption']}</p>
            </div>
        </section>

        <!-- 5. Dedicated Testimonial -->
        <section class="project-testimonial scroll-animate">
            <p>"{testimonial}"</p>
            <span class="client-name">— {client}</span>
        </section>

        <!-- 6. The Closing Call To Action -->
        <section class="project-cta scroll-animate">
            <h2>Inspired by this space?</h2>
            <p style="font-size: 1.2rem; color: var(--color-text-light); margin-bottom: 3rem;">Let's discuss how we can bring your vision to life.</p>
            <a href="index.html#enquire" class="btn-primary">Book a Consultation</a>
            <div style="margin-top: 2rem;">
                <a href="portfolio.html" style="color: var(--color-text-dark); text-decoration: underline; font-size: 0.9rem;">Or return to portfolio</a>
            </div>
        </section>
    </main>
"""

# Base Template HTML to construct the new files
base_html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{TITLE}</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
    <link rel="icon" type="image/jpeg" href="images/logo.jpg">
</head>
<body class="inner-page project-page">
    <header class="navbar" id="navbar">
        <a href="index.html" class="logo" style="display: flex; align-items: center; gap: 0.8rem;">
            <img src="images/logo.jpg" alt="Home with Aqilah" style="height: 32px; border-radius: 2px;">
            <span>HOME WITH <span class="accent">AQILAH</span></span>
        </a>
        <nav>
            <a href="index.html#about">About</a>
            <a href="index.html#services">Services</a>
            <a href="portfolio.html">Portfolio</a>
            <a href="index.html#enquire" class="btn-primary">Enquire</a>
        </nav>
    </header>

{MAIN_CONTENT}

    <footer style="background-color: var(--color-bg-alt); padding: 4rem 0 2rem; border-top: 1px solid rgba(0,0,0,0.05); text-align: center;">
        <div class="container" style="display: flex; flex-direction: column; align-items: center; gap: 1.5rem; margin-bottom: 3rem; padding-bottom: 3rem; border-bottom: 1px solid rgba(0,0,0,0.05);">
            <div class="footer-contact" style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
                <a href="tel:+6591379664" style="display: flex; align-items: center; gap: 0.8rem; color: var(--color-text-dark); text-decoration: none; font-size: 1.1rem; transition: 0.3s; font-family: var(--font-secondary); font-weight: 500;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> +65 9137 9664</a>
                <a href="mailto:homewithaqilah@gmail.com" style="display: flex; align-items: center; gap: 0.8rem; color: var(--color-text-dark); text-decoration: none; font-size: 1.1rem; transition: 0.3s; font-family: var(--font-secondary); font-weight: 500;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> homewithaqilah@gmail.com</a>
            </div>
            <div class="footer-social" style="display: flex; gap: 1.5rem; margin-top: 1rem;">
                <a href="https://www.facebook.com/people/Home-with-Aqilah/61577781420691/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" style="color: var(--color-text-dark); transition: 0.3s;"><svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg></a>
                <a href="https://www.instagram.com/home.withaqilah" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style="color: var(--color-text-dark); transition: 0.3s;"><svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>
                <a href="https://www.youtube.com/@homewithaqilah" target="_blank" rel="noopener noreferrer" aria-label="YouTube" style="color: var(--color-text-dark); transition: 0.3s;"><svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg></a>
            </div>
        </div>
        <div class="container text-center">
            <p style="font-size: 0.85rem; color: var(--color-text-light); margin: 0;">&copy; 2026 Home with Aqilah. All rights reserved.</p>
        </div>
    </footer>
    <script src="script.js"></script>
</body>
</html>"""

# Hougang Modern
hougang_main = create_case_study(
    title="Hougang Modern",
    subtitle="Dark Walnut & Cream",
    hero_img="images/Hougang/portfolio-654-hougang-10.webp",
    meta={'scope': 'Kitchen & Living Overhaul', 'style': 'Modern Contrast', 'location': '654 Hougang, SG', 'timeline': '8 Weeks'},
    challenge="Designed to evoke comfort in a temporary home, the homeowners had contrasting preferences: Mom favored darker walnut tones, while the daughter preferred lighter, airy hues. The original layout was visually segmented, hiding the beautiful afternoon light from the core living space.",
    solution="We effectively harmonized these preferences by reserving darker wood flooring and carpentry heavily for the entrance and living areas, while keeping walls, central furniture, and lighting light and airy. A glass sliding door was introduced to compartmentalize cooking smells without sacrificing visual transparency, ensuring the newly reconfigured kitchen island serves as a luminous conversation hub.",
    gallery=[
        {'img': 'images/Hougang/portfolio-654-hougang-6.webp', 'caption': 'Metallic TV Feature Wall'},
        {'img': 'images/Hougang/portfolio-654-hougang-17.webp', 'caption': 'Reconfigured Kitchen Island'},
        {'img': 'images/Hougang/portfolio-654-hougang-18.webp', 'caption': 'Dark Walnut Tones'},
        {'img': 'images/Hougang/portfolio-654-hougang-9.webp', 'caption': 'Glass Sliding Partitions'}
    ],
    testimonial="Aqilah brilliantly managed to combine both of our design tastes into a single, cohesive layout. The glass partitioning is an absolute gamechanger for our kitchen without making the home feel small.",
    client="Rachel & Family"
)
h_html = base_html.replace('{TITLE}', 'Hougang Modern | Home with Aqilah').replace('{MAIN_CONTENT}', hougang_main)
with open('project-hougang.html', 'w') as f: f.write(h_html)

# Avenue Oriental
oriental_main = create_case_study(
    title="Oriental Avenue",
    subtitle="South Residence",
    hero_img="images/Oriental_Avenue/portfolio-avenue-south-residence-1.webp",
    meta={'scope': 'Full Renovation', 'style': 'Oriental Minimalist', 'location': 'Avenue South, SG', 'timeline': '10 Weeks'},
    challenge="The client sought a profound sense of tranquility, heavily inspired by classical Oriental design, but strictly required a layout that felt uncluttered and distinctly modern. Intricate Oriental detailing often leads to visual heaviness if not balanced precisely.",
    solution="We stripped away unnecessary ornamentation and established a strict 'less is more' philosophy, utilizing authentic dark wood grains against crisp, white architectural boundaries. Clean spatial geometry anchors the Oriental artifacts and slatted wood screens, allowing the rich cultural aesthetic to breathe in a purely minimalist environment.",
    gallery=[
        {'img': 'images/Oriental_Avenue/portfolio-avenue-south-residence-2.webp', 'caption': 'Oriental Slatted Wood Screens'},
        {'img': 'images/Oriental_Avenue/portfolio-avenue-south-residence-8.webp', 'caption': 'Rich Dark Wood Grains'},
        {'img': 'images/Oriental_Avenue/portfolio-avenue-south-residence-12.webp', 'caption': 'Unified Tranquil Spaces'},
        {'img': 'images/Oriental_Avenue/portfolio-avenue-south-residence-5.webp', 'caption': 'Crisp White Boundaries'}
    ],
    testimonial="It feels like walking into a luxury resort everyday. The balance between the cultural design elements and the sheer openness of the space is exactly what we dreamed of.",
    client="Mr. & Mrs. Tan"
)
o_html = base_html.replace('{TITLE}', 'Oriental Avenue | Home with Aqilah').replace('{MAIN_CONTENT}', oriental_main)
with open('project-avenue-oriental.html', 'w') as f: f.write(o_html)

print("Created Hougang and Oriental Avenue case study HTML files.")

# Rebuild portfolio.html grid
with open('portfolio.html', 'r') as f:
    port_html = f.read()

new_grid = """<div class="portfolio-grid grid-masonry">
            <!-- 1. Hougang Modern -->
            <div class="portfolio-item scroll-animate">
                <img src="images/Hougang/portfolio-654-hougang-10.webp" alt="Hougang Modern Interior">
                <div class="portfolio-overlay">
                    <div class="overlay-content">
                        <h3>Hougang Modern</h3>
                        <p>Modern Contrast & Walnut</p>
                        <a href="project-hougang.html" class="btn-outline" style="margin-top: 1rem;">View Project</a>
                    </div>
                </div>
            </div>
            
            <!-- 2. Oriental Avenue -->
            <div class="portfolio-item scroll-animate delay-1">
                <img src="images/Oriental_Avenue/portfolio-avenue-south-residence-1.webp" alt="Oriental Avenue Interior">
                <div class="portfolio-overlay">
                    <div class="overlay-content">
                        <h3>Oriental Avenue</h3>
                        <p>Oriental Minimalist</p>
                        <a href="project-avenue-oriental.html" class="btn-outline" style="margin-top: 1rem;">View Project</a>
                    </div>
                </div>
            </div>

            <!-- 3. Pinnacle Duxton -->
            <div class="portfolio-item scroll-animate delay-2">
                <img src="images/Duxton/portfolio-pinnacle-duxton-4-768x512.jpg" alt="Pinnacle Duxton Interior">
                <div class="portfolio-overlay">
                    <div class="overlay-content">
                        <h3>The Duxton Penthouse</h3>
                        <p>Organic Contemporary</p>
                        <a href="project-duxton.html" class="btn-outline" style="margin-top: 1rem;">View Project</a>
                    </div>
                </div>
            </div>

            <!-- 4. Yishun Classic -->
            <div class="portfolio-item scroll-animate">
                <img src="images/Yishun_Classic/portfolio-664-yishun-10-768x1152.webp" alt="Yishun Classic Interior">
                <div class="portfolio-overlay">
                    <div class="overlay-content">
                        <h3>The Yishun Classic</h3>
                        <p>Heritage Elegance</p>
                        <a href="project-yishun-classic.html" class="btn-outline" style="margin-top: 1rem;">View Project</a>
                    </div>
                </div>
            </div>

            <!-- 5. Yishun Contemporary -->
            <div class="portfolio-item scroll-animate delay-1">
                <img src="images/Yishun_Contemporary/portfolio-yishun-ring-road-2-1024x754.webp" alt="Yishun Contemporary">
                <div class="portfolio-overlay">
                    <div class="overlay-content">
                        <h3>Yishun Contemporary</h3>
                        <p>Minimalist Precision</p>
                        <a href="project-yishun-contemporary.html" class="btn-outline" style="margin-top: 1rem;">View Project</a>
                    </div>
                </div>
            </div>
        </div>"""

pattern = r'<div class="portfolio-grid grid-masonry">.*?</div>\s+(?=<div class="text-center")'
port_html = re.sub(pattern, new_grid + "\n        </div>\n", port_html, flags=re.DOTALL)

with open('portfolio.html', 'w') as f:
    f.write(port_html)

print("Portfolio successfully updated with the 5 master projects.")
