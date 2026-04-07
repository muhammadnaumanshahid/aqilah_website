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

// Ensure images directory exists
const imagesRoot = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(imagesRoot)) {
    fs.mkdirSync(imagesRoot, { recursive: true });
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
app.use(express.static(path.join(__dirname, 'public')));

// Explicit root route for LiteSpeed/Passenger environments
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/api/login', apiLimiter);
app.use('/api/inquiries', apiLimiter);

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Forbidden' });
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

app.get('/api/public/analytics', (req, res) => {
    db.get("SELECT value FROM settings WHERE key = 'ga_tracking_id'", (err, row) => {
        res.json({ tracking_id: row ? row.value : '' });
    });
});

app.put('/api/settings', authenticateToken, (req, res) => {
    const updates = req.body;
    const stmt = db.prepare('UPDATE settings SET value = ? WHERE key = ?');
    for (const [key, value] of Object.entries(updates)) {
        stmt.run([value, key]);
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
    db.all('SELECT * FROM projects ORDER BY id DESC', (err, rows) => {
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
    const name = escapeHTML(req.body.name);
    const email = escapeHTML(req.body.email);
    const phone = escapeHTML(req.body.phone);
    const property_type = escapeHTML(req.body.property_type);
    const budget = escapeHTML(req.body.budget);
    const timeline = escapeHTML(req.body.timeline);
    
    // Save to DB
    db.run('INSERT INTO inquiries (name, email, phone, property_type, budget, timeline) VALUES (?, ?, ?, ?, ?, ?)',
        [name, email, phone, property_type, budget, timeline],
        async function(err) {
            if (err) return res.status(500).json({ error: 'Failed to save inquiry.' });
            
            // Try sending email
            try {
                const settings = await getSettings();
                
                if (settings.smtp_host && settings.smtp_user) {
                    const transporter = nodemailer.createTransport({
                        host: settings.smtp_host,
                        port: parseInt(settings.smtp_port) || 465,
                        secure: (parseInt(settings.smtp_port) === 465), // true for 465, false for other ports
                        auth: {
                            user: settings.smtp_user,
                            pass: settings.smtp_pass
                        }
                    });

                    await transporter.sendMail({
                        from: `"Home with Aqilah Website" <${settings.smtp_user}>`,
                        to: settings.recipient_email,
                        subject: `New Inquiry from ${name}`,
                        text: `
You have a new inquiry from the website form:

Name: ${name}
Email: ${email}
Phone: ${phone}
Property Type: ${property_type}
Budget: ${budget}
Timeline/Key Collection: ${timeline}

You can view complete details in the Admin Dashboard.
                        `
                    });
                    console.log("Email sent successfully.");
                } else {
                    console.log("SMTP not configured. Email suppressed.");
                }
            } catch (emailErr) {
                console.error("Failed to send email:", emailErr.message);
                // We still successfully saved the inquiry, so we won't throw 500
            }

            res.json({ message: 'Inquiry submitted successfully.' });
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
    let reqDir = req.query.dir || '';
    if (reqDir.startsWith('/')) reqDir = reqDir.substring(1);
    
    const targetDir = path.resolve(path.join(imagesRoot, reqDir));
    if (!targetDir.startsWith(imagesRoot)) return res.status(403).json({ error: 'Forbidden' });
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
