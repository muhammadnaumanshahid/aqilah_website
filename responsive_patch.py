import re

with open('style.css', 'r') as f:
    css = f.read()

# We will search for the first media query block (max-width: 900px) and replace everything to the end of that block,
# and also update the testimonials media query at the end. Best is to parse or just append a 
# comprehensive @media (max-width: 800px) block that overrides securely.

mobile_css = """
/* =========================================================================
   COMPREHENSIVE RESPONSIVE DESIGN OVERRIDES
   ========================================================================= */

@media (max-width: 992px) {
    /* Tablet scaling */
    .hero h1 { font-size: 4rem; }
    .page-header h1 { font-size: 3rem; }
    .about-text h2, .enquire-text h2 { font-size: 3rem; }
    .section-title { font-size: 2.5rem; }
    
    .about, .services, .projects, .enquire, .video-section, .portfolio-grid {
        padding: 5rem 0;
    }
}

@media (max-width: 768px) {
    /* Mobile core layout */
    .container { width: 92%; }
    
    /* Grids strictly single column */
    .about-grid, 
    .services-grid, 
    .project-gallery, 
    .enquire-container, 
    .portfolio-grid, 
    .detail-gallery {
        grid-template-columns: 1fr;
        gap: 3rem;
    }
    
    /* Typography reduction */
    .hero h1 { font-size: 3rem; margin-bottom: 1rem; }
    .hero p { font-size: 1.1rem; }
    .page-header { padding: 8rem 5% 3rem; }
    .page-header h1 { font-size: 2.5rem; }
    .page-header p { font-size: 1rem; }
    
    .about-text h2, .enquire-text h2 { font-size: 2.5rem; }
    .section-title { font-size: 2.2rem; margin-bottom: 2rem; }
    .service-card h3 { font-size: 1.3rem; }
    
    /* Menus & Interaction */
    nav { display: none; } /* Mobile nav implementation is usually via JS off-canvas, hidden for static resize */
    
    .mobile-menu-btn {
        display: block;
        width: 44px; /* Accessible touch target width */
        height: 44px; /* Accessible touch target height */
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 6px;
        cursor: pointer;
    }
    
    .mobile-menu-btn span {
        display: block;
        height: 2px;
        width: 30px;
        background: #fff;
        transition: 0.3s ease;
    }
    
    .navbar.scrolled .mobile-menu-btn span,
    .inner-page .navbar .mobile-menu-btn span { 
        background: var(--color-text-dark); 
    }
    
    .form-group.row { flex-direction: column; gap: 1rem; }
    
    /* Media elements constraint */
    img, video, iframe {
        max-width: 100%;
        height: auto;
    }
    
    /* Specific overrides for project images fixed height on mobile */
    .project-image img { height: 400px; }
    
    .footer-content { gap: 1.5rem; }
}

@media (max-width: 480px) {
    /* Small Mobile Phones */
    .hero h1 { font-size: 2.5rem; }
    .about-text h2, .enquire-text h2 { font-size: 2rem; }
    .section-title { font-size: 1.8rem; }
    
    .service-card { padding: 3rem 1.5rem; }
    .project-image img { height: 300px; }
    .about, .services, .projects, .enquire, .video-section, .portfolio-grid {
        padding: 4rem 0;
    }
}
"""

with open('style.css', 'a') as f:
    f.write(mobile_css)

print("Responsive CSS overrides appended to style.css")
