import re

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

def update_file(filepath, new_main_content, title_tag_text):
    with open(filepath, 'r') as f:
        html = f.read()
    
    # Update transparent header and body class exactly like Duxton
    html = html.replace('<header class="navbar scrolled" id="navbar">', '<header class="navbar" id="navbar">')
    if '<body class="inner-page">' in html:
        html = html.replace('<body class="inner-page">', '<body class="inner-page project-page">')
    
    # Update title
    html = re.sub(r'<title>.*?</title>', f'<title>{title_tag_text}</title>', html)

    # Replace <main class="project-details"> block
    pattern = r'<main class="project-details">.*?</main>'
    # If the file hasn't been migrated yet, it has project-details
    if re.search(pattern, html, flags=re.DOTALL):
        html = re.sub(pattern, new_main_content, html, flags=re.DOTALL)
    else:
        # Fallback if somehow it was already migrated (e.g. testing)
        pattern_new = r'<!-- 1\. The Hero Space.*?</main>'
        html = re.sub(pattern_new, new_main_content, html, flags=re.DOTALL)

    with open(filepath, 'w') as f:
        f.write(html)

# Yishun Classic
classic_main = create_case_study(
    title="The Yishun Classic",
    subtitle="Heritage Elegance",
    hero_img="images/portfolio-664-yishun-10-768x1152.webp",
    meta={'scope': 'Complete Overhaul', 'style': 'Classic Heritage', 'location': 'Yishun Ave, SG', 'timeline': '14 Weeks'},
    challenge="The homeowners wanted to deeply respect the classic architectural bones of the property while introducing the necessary comforts of a 21st-century lived-in space. The challenge was avoiding a 'museum' feel and prioritizing approachability.",
    solution="We installed custom moulded wall panels and soft archways to establish immediate historic symmetry. By pairing these rigid, traditional structures with distinctly modern, plush furnishings and warm ambient lighting, we bridged the generational gap.",
    gallery=[
        {'img': 'images/portfolio-664-yishun-24-768x1152.webp', 'caption': 'Bespoke Moulded Panels'},
        {'img': 'images/portfolio-664-yishun-23-768x1152.webp', 'caption': 'Symmetrical Layouts'},
        {'img': 'images/portfolio-664-yishun-21-768x1152.webp', 'caption': 'Warm Toned Accents'},
        {'img': 'images/portfolio-664-yishun-18-768x1152.webp', 'caption': 'Classic Archway Trims'}
    ],
    testimonial="Aqilah perfectly captured the historic essence we wanted without ever sacrificing modern comfort. Our home feels simultaneously grand and incredibly cozy.",
    client="The Wong Family"
)
update_file('project-yishun-classic.html', classic_main, 'The Yishun Classic | Home with Aqilah')

# Yishun Contemporary
contemporary_main = create_case_study(
    title="Yishun Contemporary",
    subtitle="Minimalist Precision",
    hero_img="images/portfolio-yishun-ring-road-2-1024x754.webp",
    meta={'scope': 'Full Renovation', 'style': 'Modern Minimalist', 'location': 'Yishun Ring Rd, SG', 'timeline': '10 Weeks'},
    challenge="A growing family required an apartment that felt radically bright, open, and serene. The original compartmentalized HDB layout was severely restricting natural airflow and limiting the penetration of afternoon sunlight.",
    solution="We aggressively opened the floorplan, utilizing a highly refined composition of clean geometric lines and bright, light-reflective materials. Every bespoke storage unit was recessed to guarantee zero visual clutter, achieving a zen-like state of modern calm.",
    gallery=[
        {'img': 'images/portfolio-yishun-ring-road-9-768x542.webp', 'caption': 'Sleek Geometric Lines'},
        {'img': 'images/portfolio-yishun-ring-road-7-768x512.jpg', 'caption': 'Recessed Custom Storage'},
        {'img': 'images/portfolio-yishun-ring-road-6-768x491.jpg', 'caption': 'Light-Reflective Finishes'},
        {'img': 'images/portfolio-yishun-ring-road-1-768x464.jpg', 'caption': 'Zen Open Concept Flow'}
    ],
    testimonial="We are obsessed with how bright and spacious our home feels now. The attention to keeping things minimal but highly functional changed the way we live entirely.",
    client="Jason & Michelle"
)
update_file('project-yishun-contemporary.html', contemporary_main, 'Yishun Contemporary | Home with Aqilah')

print("Yishun Case Studies successfully migrated!")
