module.paths.push('/home3/homewith/homewithaqilah_app/node_modules');

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const nodemailer = require('nodemailer');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const db = require('./database');
const crypto = require('crypto');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const APP_VERSION = Date.now(); // Used for dynamic Cache-Busting

// Dynamic Safe JWT Secret
let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    const secretPath = path.join(__dirname, '.jwt_secret');
    if (fs.existsSync(secretPath)) {
        JWT_SECRET = fs.readFileSync(secretPath, 'utf8').trim();
    } else {
        JWT_SECRET = crypto.randomBytes(64).toString('hex');
        fs.writeFileSync(secretPath, JWT_SECRET, { mode: 0o600 });
    }
}

// Security Headers & Rates
app.use(helmet({ 
    contentSecurityPolicy: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests. Please try again later.' }
});

// Strict limiter specifically for the inquiry form — 5 submissions per 15 min per IP
const inquiryLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many submissions from this connection. Please try again later.' }
});

// Ensure images directory exists. Hard-locked to the application folder to prevent cPanel trailing/relative ghost ENV injections
const imagesRoot = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(imagesRoot)) {
    try { fs.mkdirSync(imagesRoot, { recursive: true }); } catch (e) { console.error("Could not create images root:", e); }
}

// Multer Config for General Project Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, imagesRoot); // Uploads directly to public/images
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('INVALID_TYPE'), false);
    }
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } });

const escapeHTML = str => str ? String(str).replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
) : '';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- AUTO CACHE BUSTING MIDDLEWARE ---
// Intercepts HTML serving to dynamically append ?v=APP_VERSION to all CSS/JS assets, completely removing browser caching issues
app.use((req, res, next) => {
    let reqPath = req.path;
    
    // Normalize root requests to index.html
    if (reqPath === '/' || reqPath === '/admin' || reqPath === '/admin/') {
        reqPath = reqPath.endsWith('/') ? `${reqPath}index.html` : `${reqPath}/index.html`;
    }
    
    if (reqPath.endsWith('.html')) {
        const fullPath = path.join(__dirname, 'public', reqPath);
        if (fs.existsSync(fullPath)) {
            let content = fs.readFileSync(fullPath, 'utf8');
            // Dynamically inject the unique reboot timestamp cache-busting string into statically compiled links
            content = content.replace(/(href|src)="([^"]+\.(css|js))(\?v=[^"]*)?"/g, `$1="$2?v=${APP_VERSION}"`);
            
            res.setHeader('Content-Type', 'text/html');
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); // Never cache HTML!
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            return res.send(content);
        }
    }
    next();
});

// Ban all caching on API routes (bypasses aggressive LiteSpeed proxy caching)
app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/login', apiLimiter);
app.use('/api/inquiries', apiLimiter); // general limiter for GET (admin)
app.post('/api/inquiries', inquiryLimiter); // strict limiter for public form POST

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(401).json({ error: 'Token expired or invalid' });
        req.user = user;
        next();
    });
};

// --- AUTHENTICATION ---
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err || !user) return res.status(400).json({ error: 'Invalid credentials' });
        if (bcrypt.compareSync(password, user.password_hash)) {
            const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
            res.json({ token, email: user.email, name: user.name });
        } else {
            res.status(400).json({ error: 'Invalid credentials' });
        }
    });
});

// --- SETTINGS MANGEMENT ---
app.get('/api/settings', authenticateToken, (req, res) => {
    db.all('SELECT key, value FROM settings', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const settingsMap = {};
        rows.forEach(r => settingsMap[r.key] = r.value);
        res.json(settingsMap);
    });
});

app.get('/api/public/config', async (req, res) => {
    db.all("SELECT key, value FROM settings WHERE key IN ('ga_tracking_id', 'recaptcha_site_key')", (err, rows) => {
        const config = { tracking_id: '', recaptcha_site_key: '' };
        if (rows) {
            rows.forEach(r => {
                if (r.key === 'ga_tracking_id') config.tracking_id = r.value;
                if (r.key === 'recaptcha_site_key') config.recaptcha_site_key = r.value;
            });
        }
        res.json(config);
    });
});

app.put('/api/settings', authenticateToken, (req, res) => {
    const updates = req.body;
    const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    for (const [key, value] of Object.entries(updates)) {
        stmt.run([key, value]);
    }
    stmt.finalize();
    res.json({ message: 'Settings updated' });
});

// --- USERS MANAGEMENT ---
app.get('/api/users', authenticateToken, (req, res) => {
    db.all("SELECT id, name, email FROM users", [], (err, rows) => {
        if(err) return res.status(500).json({error: err.message});
        res.json(rows);
    });
});

app.post('/api/users', authenticateToken, (req, res) => {
    const { name, email, password } = req.body;
    const hash = bcrypt.hashSync(password, 10);
    db.run("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)", [name, email, hash], function(err) {
        if(err) return res.status(500).json({error: err.message});
        res.json({ id: this.lastID, name, email });
    });
});

app.put('/api/users/:id', authenticateToken, (req, res) => {
    const { name, email, password } = req.body;
    if (password) {
        const hash = bcrypt.hashSync(password, 10);
        db.run("UPDATE users SET name = ?, email = ?, password_hash = ? WHERE id = ?", [name, email, hash, req.params.id], function(err) {
            if(err) return res.status(500).json({error: err.message});
            res.json({ id: req.params.id, name, email });
        });
    } else {
        db.run("UPDATE users SET name = ?, email = ? WHERE id = ?", [name, email, req.params.id], function(err) {
            if(err) return res.status(500).json({error: err.message});
            res.json({ id: req.params.id, name, email });
        });
    }
});

app.delete('/api/users/:id', authenticateToken, (req, res) => {
    db.run("DELETE FROM users WHERE id = ?", [req.params.id], function(err) {
        if(err) return res.status(500).json({error: err.message});
        res.json({ message: "Deleted" });
    });
});

// --- ANALYTICS ENGINE ---
app.post('/api/track', async (req, res) => {
    let { session_id, visitor_id, duration, page } = req.body;
    if(page) page = page.substring(0, 100); // Security truncation
    if(visitor_id) visitor_id = visitor_id.substring(0, 50);
    
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    db.get('SELECT id, location FROM analytics WHERE session_id = ?', [session_id], async (err, row) => {
        if (err) return res.status(500).end();
        
        if (row) {
            db.run('UPDATE analytics SET duration = max(duration, ?) WHERE id = ?', [duration || 0, row.id]);
            res.json({ ok: true });
        } else {
            let location = 'Unknown';
            if (ip && ip !== '::1' && ip !== '127.0.0.1') {
                try {
                    const geo = await global.fetch(`http://ip-api.com/json/${ip}`).then(r => r.json());
                    if (geo && geo.country) location = geo.city ? `${geo.city}, ${geo.country}` : geo.country;
                } catch(e) {}
            } else {
                location = 'Localhost';
            }
            db.run('INSERT INTO analytics (session_id, visitor_id, ip_address, location, duration, page) VALUES (?, ?, ?, ?, ?, ?)',
                [session_id, visitor_id, ip, location, duration || 0, page], () => {
                    res.json({ ok: true });
                }
            );
        }
    });
});

app.get('/api/analytics', authenticateToken, (req, res) => {
    db.all('SELECT * FROM analytics ORDER BY date_submitted DESC LIMIT 1000', [], (err, rows) => {
        if(err) return res.status(500).json({error: err.message});
        res.json(rows);
    });
});

// Helper function to get settings as object
const getSettings = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM settings', (err, rows) => {
            if (err) return reject(err);
            const settings = {};
            rows.forEach(r => settings[r.key] = r.value);
            resolve(settings);
        });
    });
};

// --- PROJECTS API ---
app.get('/api/projects', (req, res) => {
    db.all('SELECT * FROM projects ORDER BY sort_order ASC, id ASC', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/projects/:id', (req, res) => {
    db.get('SELECT * FROM projects WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Not found' });
        res.json(row);
    });
});

app.post('/api/projects', authenticateToken, upload.any(), (req, res) => {
    const { title, location } = req.body;
    let content = req.body.content || '{}';
    let parsedContent;
    try { parsedContent = JSON.parse(content); } catch (e) { parsedContent = {}; }

    let main_image = req.body.existing_image || '';
    if (req.files) {
        req.files.forEach(f => {
            if (f.fieldname === 'main_image') {
                main_image = '/images/' + f.filename;
            } else if (f.fieldname.startsWith('gallery_image_')) {
                const idx = parseInt(f.fieldname.split('_')[2], 10);
                if (!parsedContent.gallery) parsedContent.gallery = [];
                if (!parsedContent.gallery[idx]) parsedContent.gallery[idx] = {};
                parsedContent.gallery[idx].image = '/images/' + f.filename;
            }
        });
    }
    content = JSON.stringify(parsedContent);

    db.run('INSERT INTO projects (title, location, main_image, content) VALUES (?, ?, ?, ?)',
        [title, location, main_image, content],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, title, location, main_image, content });
        }
    );
});

// Reorder projects (drag-and-drop) — MUST be before /:id to avoid Express wildcard conflict
app.put('/api/projects/reorder', authenticateToken, (req, res) => {
    const items = req.body; // [{id, sort_order}, ...]
    if (!Array.isArray(items)) return res.status(400).json({ error: 'Expected array' });
    const stmt = db.prepare('UPDATE projects SET sort_order = ? WHERE id = ?');
    items.forEach(item => stmt.run([item.sort_order, item.id]));
    stmt.finalize((err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Order saved' });
    });
});

app.put('/api/projects/:id', authenticateToken, upload.any(), (req, res) => {
    const { title, location } = req.body;
    let content = req.body.content || '{}';
    let parsedContent;
    try { parsedContent = JSON.parse(content); } catch (e) { parsedContent = {}; }

    let main_image = req.body.existing_image || '';
    if (req.files) {
        req.files.forEach(f => {
            if (f.fieldname === 'main_image') {
                main_image = '/images/' + f.filename;
            } else if (f.fieldname.startsWith('gallery_image_')) {
                const idx = parseInt(f.fieldname.split('_')[2], 10);
                if (!parsedContent.gallery) parsedContent.gallery = [];
                if (!parsedContent.gallery[idx]) parsedContent.gallery[idx] = {};
                parsedContent.gallery[idx].image = '/images/' + f.filename;
            }
        });
    }
    content = JSON.stringify(parsedContent);

    db.run('UPDATE projects SET title = ?, location = ?, main_image = ?, content = ? WHERE id = ?',
        [title, location, main_image, content, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Project updated' });
        }
    );
});

app.delete('/api/projects/:id', authenticateToken, (req, res) => {
    db.run('DELETE FROM projects WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Project deleted' });
    });
});

// --- INQUIRIES API ---
app.get('/api/inquiries', authenticateToken, (req, res) => {
    db.all('SELECT * FROM inquiries ORDER BY date_submitted DESC', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/inquiries', async (req, res) => {
    // --- SECURITY LAYER 1: Honeypot check ---
    // Bots that auto-fill hidden fields are silently discarded
    if (req.body._gotcha && req.body._gotcha.trim() !== '') {
        console.warn('Honeypot triggered — bot submission discarded.');
        return res.json({ message: 'Inquiry submitted successfully.' }); // fake success to confuse bots
    }

    // --- SECURITY LAYER 1.5: reCAPTCHA Verification ---
    const settings = await getSettings();
    if (settings.recaptcha_secret_key) {
        const token = req.body.recaptcha_token;
        if (!token) return res.status(400).json({ error: 'reCAPTCHA token missing.' });
        
        try {
            const googleVerifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${settings.recaptcha_secret_key}&response=${token}`;
            const verifyRes = await global.fetch(googleVerifyUrl, { method: 'POST' });
            const verifyData = await verifyRes.json();
            
            if (!verifyData.success || verifyData.score < 0.5) {
                console.warn('reCAPTCHA failed:', verifyData);
                return res.status(400).json({ error: 'Google reCAPTCHA flagged this submission as a potential bot.' });
            }
        } catch (e) {
            console.error('Failed to contact Google reCAPTCHA server:', e.message);
            // In case google is down, you might want to still accept it, or throw an error. We will throw 500.
            return res.status(500).json({ error: 'Error validating reCAPTCHA. Please try again.' });
        }
    }

    // --- SECURITY LAYER 2: Input validation ---
    const rawName     = (req.body.name     || '').trim();
    const rawEmail    = (req.body.email    || '').trim();
    const rawPhone    = (req.body.phone    || '').trim();
    const rawPropType = (req.body.property_type || '').trim();
    const rawBudget   = (req.body.budget   || '').trim();
    const rawTimeline = (req.body.timeline || '').trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\d\s+\-().]{8,20}$/;

    const errors = [];
    if (rawName.length < 2)                  errors.push('Name must be at least 2 characters.');
    if (!emailRegex.test(rawEmail))           errors.push('A valid email address is required.');
    if (!phoneRegex.test(rawPhone))           errors.push('A valid phone number (8–20 digits) is required.');
    if (!rawPropType)                         errors.push('Please select a property type.');
    if (!rawBudget)                           errors.push('Please select a budget range.');

    if (errors.length > 0) {
        return res.status(400).json({ error: errors.join(' ') });
    }

    // --- SECURITY LAYER 3: Duplicate cooldown (same email within 10 minutes) ---
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    db.get(
        "SELECT id FROM inquiries WHERE email = ? AND date_submitted >= ?",
        [rawEmail, tenMinutesAgo],
        async (err, existing) => {
            if (existing) {
                console.warn(`Duplicate submission blocked for: ${rawEmail}`);
                // Return a polite message — don't reveal we detected it as spam
                return res.json({ message: 'Inquiry submitted successfully.' });
            }

            // --- All checks passed: sanitise and save ---
            const name          = escapeHTML(rawName);
            const email         = escapeHTML(rawEmail);
            const phone         = escapeHTML(rawPhone);
            const property_type = escapeHTML(rawPropType);
            const budget        = escapeHTML(rawBudget);
            const timeline      = escapeHTML(rawTimeline);

            db.run('INSERT INTO inquiries (name, email, phone, property_type, budget, timeline) VALUES (?, ?, ?, ?, ?, ?)',
                [name, email, phone, property_type, budget, timeline],
                async function(dbErr) {
                    if (dbErr) return res.status(500).json({ error: 'Failed to save inquiry.' });

                    // Try sending email notification
                    try {
                        const settings = await getSettings();
                        if (settings.smtp_host && settings.smtp_user) {
                            const transporter = nodemailer.createTransport({
                                host: settings.smtp_host,
                                port: parseInt(settings.smtp_port) || 465,
                                secure: (parseInt(settings.smtp_port) === 465),
                                auth: { user: settings.smtp_user, pass: settings.smtp_pass }
                            });
                            await transporter.sendMail({
                                from: `"Home with Aqilah Website" <${settings.smtp_user}>`,
                                to: settings.recipient_email,
                                subject: `New Inquiry from ${name}`,
                                text: `You have a new inquiry from the website form:

Name: ${name}
Email: ${email}
Phone: ${phone}
Property Type: ${property_type}
Budget: ${budget}
Timeline/Key Collection: ${timeline}

You can view complete details in the Admin Dashboard.`
                            });
                            console.log('Email sent successfully.');
                        } else {
                            console.log('SMTP not configured. Email suppressed.');
                        }
                    } catch (emailErr) {
                        console.error('Failed to send email:', emailErr.message);
                    }

                    res.json({ message: 'Inquiry submitted successfully.' });
                }
            );
        }
    );
});

app.put('/api/inquiries/:id', authenticateToken, (req, res) => {
    const { status } = req.body;
    db.run('UPDATE inquiries SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Inquiry updated' });
    });
});

app.delete('/api/inquiries/:id', authenticateToken, (req, res) => {
    db.run('DELETE FROM inquiries WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Inquiry deleted' });
    });
});


// --- MEDIA LIBRARY API ---

const mediaStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        let reqDir = req.body.dir || '';
        if (reqDir.startsWith('/')) reqDir = reqDir.substring(1);
        const targetDir = path.resolve(path.join(imagesRoot, reqDir));
        if (!targetDir.startsWith(imagesRoot)) {
            return cb(new Error('Invalid directory'), false);
        }
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        cb(null, targetDir);
    },
    filename: (req, file, cb) => {
        // preserve original filename but make it safe
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        cb(null, safeName);
    }
});
const mediaUpload = multer({ storage: mediaStorage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } });

app.get('/api/media', authenticateToken, (req, res) => {
    // We use 'folder' instead of 'dir' because many basic WAF configs (like cPanel ModSecurity)
    // aggressively false-positive strings with '?dir=' as Directory Traversal attacks and return HTML 403 pages
    let reqDir = req.query.folder || '';
    reqDir = reqDir.replace(/\.\./g, '').replace(/^\/+/, ''); // Sanitize rigorously to prevent traversal
    
    const targetDir = path.resolve(path.join(imagesRoot, reqDir));
    // Check if resolved path starts with the absolute images path reliably
    if (!targetDir.startsWith(imagesRoot)) return res.status(403).json({ error: 'Path resolution forbidden' });
    if (!fs.existsSync(targetDir)) return res.status(404).json({ error: 'Directory not found' });
    
    const items = fs.readdirSync(targetDir, { withFileTypes: true });
    const folders = [];
    const files = [];
    
    items.forEach(item => {
        if (item.name.startsWith('.')) return;
        if (item.isDirectory()) {
            folders.push(item.name);
        } else if (item.isFile()) {
            const ext = path.extname(item.name).toLowerCase();
            if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext)) {
                files.push(item.name);
            }
        }
    });
    
    res.json({ folders, files });
});

app.post('/api/media/folder', authenticateToken, (req, res) => {
    let reqDir = req.body.dir || '';
    if (reqDir.startsWith('/')) reqDir = reqDir.substring(1);
    const name = (req.body.name || '').replace(/[^a-zA-Z0-9_\-\ ]/g, '');
    if (!name) return res.status(400).json({ error: 'Invalid folder name' });
    
    const targetDir = path.resolve(path.join(imagesRoot, reqDir, name));
    if (!targetDir.startsWith(imagesRoot)) return res.status(403).json({ error: 'Forbidden' });
    if (fs.existsSync(targetDir)) return res.status(400).json({ error: 'Folder already exists' });
    
    fs.mkdirSync(targetDir, { recursive: true });
    res.json({ success: true });
});

app.post('/api/media/item/delete', authenticateToken, (req, res) => {
    let reqDir = req.body.dir || '';
    if (reqDir.startsWith('/')) reqDir = reqDir.substring(1);
    const itemName = req.body.name;
    if (!itemName) return res.status(400).json({ error: 'Item name required' });
    
    // Prevent navigating upwards out of public/images
    if (itemName.includes('..') || reqDir.includes('..')) return res.status(403).json({ error: 'Forbidden' });

    const targetPath = path.resolve(path.join(imagesRoot, reqDir, itemName));
    if (!targetPath.startsWith(imagesRoot)) return res.status(403).json({ error: 'Forbidden' });
    if (!fs.existsSync(targetPath)) return res.status(404).json({ error: 'Item not found' });
    
    try {
        fs.rmSync(targetPath, { recursive: true, force: true });
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to delete item' });
    }
});

app.post('/api/media/upload', authenticateToken, (req, res) => {
    mediaUpload.array('files', 20)(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'File too large (Max 50MB)' : err.message });
        } else if (err) {
            return res.status(400).json({ error: err.message === 'INVALID_TYPE' ? 'Images only allowed' : 'Unknown upload error' });
        }
        res.json({ success: true });
    });
});

// --- SEO & SITEMAP ---
app.get('/sitemap.xml', (req, res) => {
    db.all('SELECT id FROM projects ORDER BY id DESC', (err, rows) => {
        if (err) return res.status(500).end();
        
        const baseUrl = 'https://homewithaqilah.com';
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${baseUrl}/</loc>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>${baseUrl}/portfolio.html</loc>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>`;

        rows.forEach(p => {
            xml += `
    <url>
        <loc>${baseUrl}/project.html?id=${p.id}</loc>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>`;
        });
        
        xml += '\n</urlset>';
        
        res.header('Content-Type', 'application/xml');
        res.send(xml);
    });
});

// Catch-all route to serve the SPA Admin if it gets requested directly
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
