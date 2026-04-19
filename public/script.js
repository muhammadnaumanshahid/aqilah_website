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

    // Formspree Live Submission Interception
    const form = document.getElementById('enquiry-form');
    const formMessage = document.getElementById('form-message');

    if(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = form.querySelector('.btn-submit') || form.querySelector('button[type="submit"]');
            const originalText = btn.innerText;
            btn.innerText = 'Sending...';
            btn.disabled = true;

            try {
                const formData = new FormData(form);
                const payload = Object.fromEntries(formData.entries());
                
                const executeSubmission = async (token = null) => {
                    if (token) payload.recaptcha_token = token;
                    return await fetch('/api/inquiries', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                };

                let response;
                if (window.RECAPTCHA_SITE_KEY && typeof grecaptcha !== 'undefined') {
                    response = await new Promise((resolve, reject) => {
                        grecaptcha.ready(function() {
                            grecaptcha.execute(window.RECAPTCHA_SITE_KEY, {action: 'submit'}).then(async function(token) {
                                try { resolve(await executeSubmission(token)); } catch(e) { reject(e); }
                            }).catch(reject);
                        });
                    });
                } else {
                    response = await executeSubmission();
                }
                
                if (response.ok) {
                    form.reset();
                    formMessage.style.color = '#2e7d32'; // Success Green
                    formMessage.innerText = 'Message received. We will be in touch shortly!';
                } else {
                    const data = await response.json();
                    if (data.error) {
                        formMessage.innerText = data.error;
                    } else if (Object.hasOwn(data, 'errors')) {
                        formMessage.innerText = data["errors"].map(error => error["message"]).join(", ");
                    } else {
                        formMessage.innerText = 'Oops! There was a problem submitting your form.';
                    }
                    formMessage.style.color = '#c62828'; // Error Red
                }
            } catch (error) {
                formMessage.style.color = '#c62828';
                formMessage.innerText = 'Network error. Please try again.';
            } finally {
                btn.innerText = originalText;
                btn.disabled = false;
                formMessage.style.display = 'block';
                
                // Hide message after 5 seconds
                setTimeout(() => {
                    formMessage.style.display = 'none';
                    formMessage.innerText = '';
                }, 5000);
            }
        });
    }

    initTracker();
});

function initTracker() {
    let consent = localStorage.getItem('cookieConsent');
    
    if (!consent) {
        const banner = document.createElement('div');
        banner.style.cssText = 'position:fixed; bottom:0; left:0; width:100%; background:#1a1a1a; color:#fff; padding:1rem; display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; z-index:9999; font-family:"Outfit", sans-serif;';
        banner.innerHTML = `
            <div style="margin-bottom:0.5rem; font-size:0.9rem;">
                We use cookies to improve your experience and analyze website traffic. By accepting, you consent to our use of cookies.
            </div>
            <div style="display:flex; gap:0.5rem;">
                <button id="consent-decline" style="padding:0.5rem 1rem; border:1px solid #fff; background:transparent; color:#fff; cursor:pointer;">Decline</button>
                <button id="consent-accept" style="padding:0.5rem 1rem; background:#fff; color:#1a1a1a; cursor:pointer;">Accept</button>
            </div>
        `;
        document.body.appendChild(banner);
        
        document.getElementById('consent-accept').addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'accepted');
            banner.remove();
            startTrackingSession();
        });
        document.getElementById('consent-decline').addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'declined');
            banner.remove();
        });
    } else if (consent === 'accepted') {
        startTrackingSession();
    }
}

function startTrackingSession() {
    let visitorId = localStorage.getItem('visitor_id');
    if (!visitorId) {
        visitorId = 'v_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('visitor_id', visitorId);
    }
    
    const sessionId = 's_' + Math.random().toString(36).substr(2, 9);
    const startTime = Date.now();
    
    const pingAnalytics = () => {
        const duration = Math.floor((Date.now() - startTime) / 1000);
        fetch('/api/track', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({
                session_id: sessionId,
                visitor_id: visitorId,
                duration: duration,
                page: window.location.pathname
            }), 
            keepalive: true 
        }).catch(e => {});
    };
    
    setInterval(pingAnalytics, 10000); 
    window.addEventListener('beforeunload', pingAnalytics);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') pingAnalytics();
    });
}

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
                <a href="https://www.instagram.com/home.withaqilah" target="_blank" rel="noopener noreferrer">Instagram</a>
                <a href="https://www.youtube.com/@homewithaqilah" target="_blank" rel="noopener noreferrer">YouTube</a>
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

    // 4. Dynamic Projects Loading
    const gallery = document.querySelector('.project-gallery');
    if (gallery) {
        // Load projects from API
        fetch('/api/projects')
            .then(res => res.json())
            .then(projects => {
                if (projects && projects.length > 0) {
                    let displayProjects = projects;
                    if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
                        displayProjects = projects.slice(0, 4);
                    }
                    
                    gallery.innerHTML = ''; // clear static projects
                    displayProjects.forEach((p, idx) => {
                        const delayClass = idx % 2 === 1 ? 'delay-1' : '';
                        gallery.innerHTML += `
                            <a href="project.html?id=${p.id}" class="project-item scroll-animate ${delayClass} visible">
                                <div class="project-image">
                                    <img src="${p.main_image}" alt="${p.title}" loading="lazy" decoding="async">
                                    <div class="project-overlay">
                                        <h3>${p.title}</h3>
                                        <p>${p.location}</p>
                                    </div>
                                </div>
                            </a>
                        `;
                    });
                    
                    // Restore scroll once DOM paints injected heights
                    const savedScroll = sessionStorage.getItem('scrollPos_' + window.location.pathname);
                    if (savedScroll) {
                        requestAnimationFrame(() => window.scrollTo(0, parseInt(savedScroll, 10)));
                    }
                }
            })
            .catch(err => console.error("Could not fetch projects:", err));
    } else {
        // For non-portfolio pages, just restore natively on load
        const savedScroll = sessionStorage.getItem('scrollPos_' + window.location.pathname);
        if (savedScroll) requestAnimationFrame(() => window.scrollTo(0, parseInt(savedScroll, 10)));
    }
});

// Scroll Position Capture System
window.addEventListener('beforeunload', () => {
    sessionStorage.setItem('scrollPos_' + window.location.pathname, window.scrollY);
});

function loadConfig() {
    fetch('/api/public/config').then(r => r.json()).then(data => {
        // Analytics
        if (data.tracking_id && data.tracking_id.trim() !== '') {
            const script1 = document.createElement('script');
            script1.async = true;
            script1.src = `https://www.googletagmanager.com/gtag/js?id=${data.tracking_id}`;
            document.head.appendChild(script1);
            
            const script2 = document.createElement('script');
            script2.innerHTML = `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${data.tracking_id}');`;
            document.head.appendChild(script2);
            console.log("Analytics engine active.");
        }
        
        // reCAPTCHA
        if (data.recaptcha_site_key && data.recaptcha_site_key.trim() !== '') {
            window.RECAPTCHA_SITE_KEY = data.recaptcha_site_key;
            const script = document.createElement('script');
            script.src = `https://www.google.com/recaptcha/api.js?render=${data.recaptcha_site_key}`;
            document.head.appendChild(script);
            console.log("reCAPTCHA protection active.");
        }
    }).catch(e => console.error("Could not load public configuration:", e));
}
loadConfig();
