import os
import glob
import re

html_files = glob.glob('*.html')

contact_html = '''
            <div class="contact-info" style="margin: 1.5rem 0 0.5rem; color: var(--color-text-light); display: flex; gap: 2rem; justify-content: center; font-size: 0.95rem; align-items: center; flex-wrap: wrap;">
                <a href="tel:+6591379664" style="display:-webkit-box; align-items:center; gap:0.5rem;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> +65 9137 9664</a>
                <span>|</span>
                <a href="mailto:homewithaqilah@gmail.com" style="display:-webkit-box; align-items:center; gap:0.5rem;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> homewithaqilah@gmail.com</a>
            </div>
            <p>&copy; 2026 Home with Aqilah.</p>'''

for file in html_files:
    with open(file, 'r') as f:
        content = f.read()

    # Replace the sentence in the index.html or other files if it exists
    content = content.replace("Timeless design for intentional living.", "")
    content = content.replace("<p>&copy; 2026 Home with Aqilah. </p>", "<p>&copy; 2026 Home with Aqilah.</p>")

    # Replace old copyright P tags with new contact html
    content = re.sub(r'<p>&copy; 2026 Home with Aqilah\.</p>', contact_html, content)
    
    # Update the Enquire text on the main page to include contact
    enquire_text_old = "<p>Tell us about your space. We'll handle the rest.</p>"
    enquire_text_new = "<p>Tell us about your space, or reach out to us directly at <br><strong>+65 9137 9664</strong> / <strong>homewithaqilah@gmail.com</strong>.</p>"
    content = content.replace(enquire_text_old, enquire_text_new)

    with open(file, 'w') as f:
        f.write(content)

print("Updates complete.")
