js_code = """
document.addEventListener('DOMContentLoaded', () => {
    // 1. Desktop & Mobile FAB Injection
    const fabHTML = `
        <div class="fab-container">
            <a href="index.html#enquire" class="fab-btn">Book Consultation</a>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', fabHTML);

    // 2. Fullscreen Mobile Overlay Menu Injection
    const overlayHTML = `
        <div class="mobile-overlay" id="mobile-overlay">
            <nav class="overlay-nav">
                <a href="index.html#hero" class="overlay-link">Home</a>
                <a href="index.html#about" class="overlay-link">About</a>
                <a href="index.html#services" class="overlay-link">Services</a>
                <a href="portfolio.html" class="overlay-link">Portfolio</a>
                <a href="index.html#enquire" class="btn-primary overlay-link">Book Now</a>
            </nav>
            <div class="overlay-social">
                <a href="https://instagram.com/home.withaqilah" target="_blank" rel="noopener noreferrer">Instagram</a>
                <a href="https://youtube.com/@homewithaqilah" target="_blank" rel="noopener noreferrer">YouTube</a>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', overlayHTML);

    // 3. Menu Toggle Logic
    const menuBtn = document.getElementById('mobile-menu-btn');
    const overlay = document.getElementById('mobile-overlay');
    const overlayLinks = document.querySelectorAll('.overlay-link');
    
    if(menuBtn && overlay) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('active');
            overlay.classList.toggle('open');
            document.body.classList.toggle('no-scroll'); // Prevent background scrolling
        });

        // Close overlay when a link is clicked
        overlayLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuBtn.classList.remove('active');
                overlay.classList.remove('open');
                document.body.classList.remove('no-scroll');
            });
        });
    }
});
"""

css_code = """
/* =========================================================================
   2026 INTERACTION & CONVERSION UPGRADES
   ========================================================================= */

/* 1. Accessibility (:focus-visible) */
a:focus-visible, button:focus-visible, input:focus-visible, select:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 4px;
    border-radius: 2px;
}

/* 2. Floating Action Button (FAB) */
.fab-container {
    position: fixed;
    bottom: 30px;
    right: 30px;
    z-index: 900;
}

.fab-btn {
    background-color: var(--color-text-dark);
    color: #fff;
    padding: 1rem 2rem;
    border-radius: 50px;
    font-weight: 500;
    font-size: 0.95rem;
    letter-spacing: 1px;
    text-transform: uppercase;
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    display: inline-block;
}

.fab-btn:hover {
    background-color: var(--color-accent);
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(122, 40, 40, 0.25);
    color: #fff;
}

/* Hide FAB on small screens where it crushes content, or scale it down */
@media (max-width: 768px) {
    .fab-container { right: 20px; bottom: 20px; }
    .fab-btn { padding: 0.8rem 1.5rem; font-size: 0.85rem; }
}

@media (max-width: 480px) {
    .fab-container { display: none; } /* Better to rely on mobile nav CTA on tiny screens */
}

/* 3. Immersive Dark Fullscreen Overlay Menu */
.mobile-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(18, 18, 18, 0.98);
    backdrop-filter: blur(15px);
    z-index: 998; /* Below mobile navbar due to fixed stacking */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.5s ease, visibility 0.5s ease;
}

.mobile-overlay.open {
    opacity: 1;
    visibility: visible;
}

.overlay-nav {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2.5rem;
}

.overlay-nav a {
    color: #F8F7F5;
    font-family: var(--font-heading);
    font-size: 2.5rem;
    display: block;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.4s ease, transform 0.4s ease;
}

.mobile-overlay.open .overlay-nav a {
    opacity: 1;
    transform: translateY(0);
}

.mobile-overlay.open .overlay-nav a:nth-child(1) { transition-delay: 0.1s; }
.mobile-overlay.open .overlay-nav a:nth-child(2) { transition-delay: 0.2s; }
.mobile-overlay.open .overlay-nav a:nth-child(3) { transition-delay: 0.3s; }
.mobile-overlay.open .overlay-nav a:nth-child(4) { transition-delay: 0.4s; }
.mobile-overlay.open .overlay-nav a:nth-child(5) { transition-delay: 0.5s; font-family: var(--font-body); font-size: 1rem; margin-top: 1rem; }

.overlay-social {
    position: absolute;
    bottom: 50px;
    display: flex;
    gap: 2rem;
    opacity: 0;
    transition: opacity 0.5s ease 0.6s;
}

.overlay-social a {
    color: #aaa;
    font-size: 0.9rem;
    letter-spacing: 1px;
    text-transform: uppercase;
}

.mobile-overlay.open .overlay-social {
    opacity: 1;
}

/* Hamburger to X Transform Animation */
.mobile-menu-btn { z-index: 999; } /* keep button above overlay */

.mobile-menu-btn.active span:nth-child(1) {
    transform: translateY(9px) rotate(45deg);
    background: #fff !important;
}
.mobile-menu-btn.active span:nth-child(2) {
    opacity: 0;
}
.mobile-menu-btn.active span:nth-child(3) {
    transform: translateY(-9px) rotate(-45deg);
    background: #fff !important;
}

body.no-scroll {
    overflow: hidden;
}
"""

with open('script.js', 'a') as f:
    f.write(js_code)

with open('style.css', 'a') as f:
    f.write(css_code)

print("UX Interactive upgrades seamlessly integrated.")
