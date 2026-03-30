import os

css_apped = """
/* =========================================================================
   TESTIMONIALS SECTION
   ========================================================================= */
.testimonials {
    padding: 8rem 0;
    background-color: var(--color-bg-alt);
}

.testimonials-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 4rem;
}

.testimonial-card {
    background-color: var(--color-bg);
    padding: 3rem 2.5rem;
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.03);
    transition: var(--transition-medium);
    border: 1px solid rgba(0,0,0,0.02);
}

.testimonial-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0,0,0,0.06);
}

.testimonial-card .stars {
    color: var(--color-accent);
    margin-bottom: 1.5rem;
    display: flex;
    gap: 0.2rem;
}

.testimonial-card .review-text {
    font-size: 1rem;
    line-height: 1.8;
    color: var(--color-text-dark);
    font-style: italic;
    margin-bottom: 2rem;
}

.testimonial-card .reviewer-name {
    font-family: var(--font-primary);
    font-weight: 600;
    font-size: 1.2rem;
    color: var(--color-text-dark);
    margin-bottom: 0.2rem;
}

.testimonial-card .reviewer-role {
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--color-text-light);
}

@media (max-width: 768px) {
    .testimonials { padding: 5rem 0; }
    .testimonial-card { padding: 2rem 1.5rem; }
}
"""

with open('style.css', 'a') as f:
    f.write(css_apped)
