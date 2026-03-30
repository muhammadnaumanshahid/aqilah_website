document.addEventListener('DOMContentLoaded', () => {

    // Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Scroll Animation Observer (Intersection Observer)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Stop observing once it's visible
            }
        });
    }, observerOptions);

    const animateElements = document.querySelectorAll('.scroll-animate');
    animateElements.forEach(el => observer.observe(el));

    // Smooth Scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Dummy Form Submission handling
    const form = document.getElementById('enquiry-form');
    const formMessage = document.getElementById('form-message');

    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            // In a real scenario, an AJAX fetch request would be made here.
            
            // Simulating API call
            const btn = form.querySelector('.btn-submit');
            const originalText = btn.innerText;
            btn.innerText = 'Sending...';
            btn.disabled = true;

            setTimeout(() => {
                form.reset();
                btn.innerText = originalText;
                btn.disabled = false;
                formMessage.style.display = 'block';
                formMessage.innerText = 'Thank you for your enquiry. Aqilah will be in touch shortly.';
                
                // Hide message after 5 seconds
                setTimeout(() => {
                    formMessage.style.display = 'none';
                }, 5000);
            }, 1500);
        });
    }

});

document.addEventListener('DOMContentLoaded', () => {

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
