import re

# 1. Update style.css
css_addition = """
/* =========================================================================
   PROJECT CASE STUDY TEMPLATE (2026 ARCHITECTURE)
   ========================================================================= */

/* Hero Header */
.project-hero {
    position: relative;
    height: 85vh;
    min-height: 600px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    background-size: cover;
    background-position: center;
    background-color: #111;
    margin-bottom: 4rem;
}
.project-hero::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.5) 100%);
}
.project-hero-content {
    position: relative;
    z-index: 2;
    text-align: center;
    color: #fff;
    padding-bottom: 6rem;
    width: 90%;
    max-width: 1000px;
}
.project-hero h1 {
    font-size: 5rem;
    margin-bottom: 1rem;
    text-shadow: 0 4px 20px rgba(0,0,0,0.3);
}
@media (max-width: 768px) {
    .project-hero h1 { font-size: 3rem; }
    .project-hero { height: 75vh; }
}

/* Meta Data Grid */
.project-meta {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
    padding: 3rem 0;
    border-top: 1px solid var(--color-border);
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 6rem;
}
.meta-item { text-align: center; }
.meta-label {
    display: block;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: var(--color-text-light);
    margin-bottom: 0.5rem;
}
.meta-value {
    display: block;
    font-family: var(--font-primary);
    font-size: 1.2rem;
    font-weight: 500;
}
@media (max-width: 900px) {
    .project-meta { grid-template-columns: repeat(2, 1fr); padding: 2rem 0; }
}
@media (max-width: 480px) {
    .project-meta { grid-template-columns: 1fr; border: none; padding: 1rem 0; border-top: 1px solid var(--color-border); gap: 1.5rem; }
}

/* Narrative Split Content */
.project-narrative {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5rem;
    margin-bottom: 8rem;
}
.narrative-block h3 {
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: var(--color-text-light);
    margin-bottom: 1.5rem;
}
.narrative-block p {
    font-size: 1.25rem;
    line-height: 1.8;
}
@media (max-width: 768px) {
    .project-narrative { grid-template-columns: 1fr; gap: 3rem; margin-bottom: 5rem; }
}

/* Curated Gallery & Micro-captions */
.curated-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 3rem;
    margin-bottom: 8rem;
}
.gallery-item img {
    width: 100%;
    height: auto;
    box-shadow: 0 20px 40px rgba(0,0,0,0.08);
}
.micro-caption {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: var(--color-text-light);
    margin-top: 1rem;
    text-align: center;
}
@media (max-width: 768px) {
    .curated-gallery { grid-template-columns: 1fr; gap: 2rem; margin-bottom: 5rem; }
}

/* Project Specific Dedicated Testimonial */
.project-testimonial {
    text-align: center;
    max-width: 900px;
    margin: 0 auto 8rem;
    padding: 6rem 3rem;
    background-color: var(--color-bg-alt);
    border-radius: 4px;
}
.project-testimonial p {
    font-family: var(--font-primary);
    font-size: 2rem;
    font-style: italic;
    font-weight: 300;
    line-height: 1.6;
    color: var(--color-text-dark);
    margin-bottom: 2rem;
}
.project-testimonial .client-name {
    font-size: 1rem;
    letter-spacing: 2px;
    text-transform: uppercase;
    font-weight: 600;
}
@media (max-width: 768px) {
    .project-testimonial { padding: 4rem 2rem; margin-bottom: 5rem; }
    .project-testimonial p { font-size: 1.5rem; }
}

/* Project specific CTA */
.project-cta {
    text-align: center;
    padding: 8rem 0;
    border-top: 1px solid var(--color-border);
}
.project-cta h2 { font-size: 3.5rem; margin-bottom: 2rem; }
@media (max-width: 768px) {
    .project-cta h2 { font-size: 2.5rem; }
}
"""

with open('style.css', 'a') as f:
    f.write(css_addition)


# 2. Update project-duxton.html
new_main = """
    <!-- 1. The Hero Space (The Hook) -->
    <section class="project-hero" style="background-image: url('images/portfolio-pinnacle-duxton-4-768x512.jpg');">
        <div class="project-hero-content scroll-animate">
            <h1 style="font-family: var(--font-heading); font-weight: 400;">The Duxton Penthouse</h1>
            <p style="font-size: 1.2rem; letter-spacing: 2px; text-transform: uppercase; opacity: 0.9;">Pinnacle @ Duxton</p>
        </div>
    </section>

    <main class="container">
        <!-- 2. Metadata Analytics -->
        <div class="project-meta scroll-animate delay-1">
            <div class="meta-item">
                <span class="meta-label">Scope</span>
                <span class="meta-value">Full Renovation</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Style</span>
                <span class="meta-value">Organic Contemporary</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Location</span>
                <span class="meta-value">Tanjong Pagar, SG</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Timeline</span>
                <span class="meta-value">12 Weeks</span>
            </div>
        </div>

        <!-- 3. The Narrative (Brief vs Solution) -->
        <section class="project-narrative">
            <div class="narrative-block scroll-animate">
                <h3>The Challenge</h3>
                <p>Elevated high above the vibrant cityscape at Pinnacle @ Duxton, the clients desired a sanctuary that starkly contrasted with the busy urban environment below. The original layout felt disjointed and lacked the organic flow necessary to host intimate gatherings while retaining privacy.</p>
            </div>
            <div class="narrative-block scroll-animate delay-1">
                <h3>The Solution</h3>
                <p>We introduced a soft palette of muted pastels and tactile finishes, fundamentally softening the rigid architectural lines of the apartment. By utilizing custom fluted glass partitions and low-profile, curved furnishings, we created an open-concept canvas that envelopes the owners in quiet, contemporary sophistication.</p>
            </div>
        </section>

        <!-- 4. Curated Gallery -->
        <section class="curated-gallery">
            <div class="gallery-item scroll-animate">
                <img src="images/portfolio-pinnacle-duxton-9-838x1024.webp" alt="Duxton Interior Soft Textures">
                <p class="micro-caption">Custom Curved Cabinetry</p>
            </div>
            <div class="gallery-item scroll-animate delay-1">
                <img src="images/portfolio-pinnacle-duxton-10-768x512.webp" alt="Duxton Interior Lighting">
                <p class="micro-caption">Organic Layered Lighting</p>
            </div>
            <div class="gallery-item scroll-animate">
                <img src="images/portfolio-pinnacle-duxton-2-768x482.webp" alt="Duxton Dining Space">
                <p class="micro-caption">Fluted Glass Partitions</p>
            </div>
            <div class="gallery-item scroll-animate delay-1">
                <img src="images/portfolio-pinnacle-duxton-3-768x482.jpg" alt="Duxton Living Room">
                <p class="micro-caption">Tactile Pastels & Warm Wood</p>
            </div>
        </section>

        <!-- 5. Dedicated Testimonial -->
        <section class="project-testimonial scroll-animate">
            <p>"Aqilah completely transformed our high-rise apartment. She managed to take a cold, standard layout and turn it into the warmest, most inviting sanctuary we've ever lived in. Every corner feels intentional."</p>
            <span class="client-name">— Ryan & Sarah S.</span>
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

with open('project-duxton.html', 'r') as f:
    html = f.read()

# Replace everything from <main class="project-details"> to </main>
# Using regex to substitute the entire <main> block and its contents
pattern = r'<main class="project-details">.*?</main>'
html = re.sub(pattern, new_main, html, flags=re.DOTALL)

with open('project-duxton.html', 'w') as f:
    f.write(html)

print("Case Study architecture deployed successfully to project-duxton.html")
