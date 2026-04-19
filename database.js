const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Failed to connect to SQLite database:", err.message);
    } else {
        console.log("Connected to the SQLite database.");
    }
});

// Initialize Tables
db.serialize(() => {
    // 1. Projects Table
    db.run(`CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        location TEXT,
        property_type TEXT DEFAULT 'HDB',
        main_image TEXT,
        content TEXT,
        sort_order INTEGER DEFAULT 0
    )`);
    
    // Migration: add property_type if missing
    db.run(`ALTER TABLE projects ADD COLUMN property_type TEXT DEFAULT 'HDB'`, (err) => {
        if (!err) console.log('Migration: property_type column added to projects.');
    });

    // Migration: add sort_order to existing projects table if missing
    db.run(`ALTER TABLE projects ADD COLUMN sort_order INTEGER DEFAULT 0`, (err) => {
        if (!err) {
            // Column was just added — populate it from current id order
            db.run(`UPDATE projects SET sort_order = id WHERE sort_order = 0 OR sort_order IS NULL`);
            console.log('Migration: sort_order column added to projects.');
        }
    });

    // 2. Inquiries Table
    db.run(`CREATE TABLE IF NOT EXISTS inquiries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        property_type TEXT,
        budget TEXT,
        timeline TEXT,
        date_submitted DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'new'
    )`);

    // 3. Users (Admin) Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
    )`);

    // 4. Settings (SMTP/Admin configuration) Table
    db.run(`CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
    )`);

    // 5. Analytics Table
    db.run(`CREATE TABLE IF NOT EXISTS analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        visitor_id TEXT,
        ip_address TEXT,
        location TEXT,
        duration INTEGER,
        page TEXT,
        date_submitted DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Performance indexes
    db.run(`CREATE INDEX IF NOT EXISTS idx_inquiries_email ON inquiries(email)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_inquiries_date ON inquiries(date_submitted)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_analytics_visitor ON analytics(visitor_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(date_submitted)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_projects_sort ON projects(sort_order)`);

    // Seed default admin user if none exists
    // SECURITY TODO: Change the admin password immediately after first login via Admin Dashboard > Team
    db.get('SELECT id FROM users WHERE email = ?', ['admin@homewithaqilah.com'], (err, row) => {
        if (!row) {
            const defaultPassword = bcrypt.hashSync('admin123', 10);
            db.run('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', 
                ['Super Admin', 'admin@homewithaqilah.com', defaultPassword]);
            console.log("Default admin user created: admin@homewithaqilah.com / admin123");
        }
    });

    // Seed default settings if empty
    db.get("SELECT value FROM settings WHERE key = 'smtp_host'", (err, row) => {
        if (!row) {
            const defaultSettings = [
                ['smtp_host', 'smtp.gmail.com'],
                ['smtp_port', '465'],
                ['smtp_user', ''],
                ['smtp_pass', ''],
                ['recipient_email', 'info@homewithaqilah.com'],
                ['site_url', 'https://homewithaqilah.com']
            ];
            const stmt = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
            defaultSettings.forEach(s => stmt.run(s));
            stmt.finalize();
            console.log("Default SMTP settings initialized.");
        }
    });

    db.get("SELECT value FROM settings WHERE key = 'ga_tracking_id'", (err, row) => {
        if (!row) {
            db.run("INSERT INTO settings (key, value) VALUES ('ga_tracking_id', '')");
        }
    });
    
    // Ensure site_url exists
    db.get("SELECT value FROM settings WHERE key = 'site_url'", (err, row) => {
        if (!row) {
            db.run("INSERT OR IGNORE INTO settings (key, value) VALUES ('site_url', 'https://homewithaqilah.com')");
        }
    });
});

module.exports = db;
