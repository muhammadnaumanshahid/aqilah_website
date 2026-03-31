import re
import os

filepath = 'project-duxton.html'

with open(filepath, 'r') as f:
    html = f.read()

# 1. Modify HTML to fix Header behavior
# Remove 'scrolled' class from header to allow it to start transparent
html = html.replace('<header class="navbar scrolled" id="navbar">', '<header class="navbar" id="navbar">')
# Add 'project-page' to body class to allow targeted CSS overrides
html = html.replace('<body class="inner-page">', '<body class="inner-page project-page">')

with open(filepath, 'w') as f:
    f.write(html)

css_patch = """
/* =========================================================================
   PROJECT PAGE LAYOUT PATCHES (OVERRIDING STANDARD INNER-PAGE BEHAVIOR)
   ========================================================================= */

/* 1. Header Clash Fix */
body.project-page .navbar {
    background-color: transparent !important;
    box-shadow: none !important;
    border-bottom: 1px solid rgba(255,255,255,0.1) !important;
}
body.project-page .navbar.scrolled {
    background-color: rgba(255, 255, 255, 0.98) !important;
    box-shadow: 0 4px 20px rgba(0,0,0,0.05) !important;
    border-bottom: none !important;
}
/* Ensure links are white when transparent, dark when scrolled */
body.project-page .navbar:not(.scrolled) .logo, 
body.project-page .navbar:not(.scrolled) nav a, 
body.project-page .navbar:not(.scrolled) .social-icons a {
    color: #fff !important; 
}
body.project-page .navbar:not(.scrolled) .mobile-menu-btn span {
    background: #fff !important;
}

/* 2. Gallery Alignment Fix */
.curated-gallery .gallery-item img {
    height: 500px !important;
    width: 100% !important;
    object-fit: cover !important;
    border-radius: 4px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.05) !important;
}

/* 3. Excessive Gaps Fix */
.project-meta { margin-bottom: 4rem !important; }
.project-narrative { margin-bottom: 4rem !important; }
.curated-gallery { margin-bottom: 4rem !important; }
.project-testimonial {
    margin: 0 auto 4rem !important; /* Shaved off 4rem of gap */
    padding: 4rem 3rem !important;  /* Reduced height */
}
.project-cta {
    padding: 5rem 0 3rem !important; /* Reduced vertical padding */
}
"""

with open('style.css', 'a') as f:
    f.write(css_patch)

print("Visual debugging patches applied successfully")
