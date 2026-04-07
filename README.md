# Home with Aqilah - Full Stack Architecture

![Home with Aqilah](public/images/logo.jpg)

**Home with Aqilah** has been modernized from a static template into a fully dynamic, secure, and data-driven full-stack application. It features a custom CMS for portfolio management, an interactive JWT-secured Admin Dashboard, and a GDPR-compliant passive analytical tracking engine.

## 🚀 Tech Stack

**Frontend Interface:**
- **HTML5 & CSS3** (Custom Minimalist Styling, responsive Grid/Flex modules)
- **Vanilla JavaScript** (ES6+, DOM Intersection Observers, Fetch API polling)

**Backend Architecture:**
- **Server:** Node.js powered by Express.js
- **Database:** SQLite3 (`database.sqlite`) for relational storage
- **Security Pipeline:** `helmet` (HTTP header fortification), `express-rate-limit` (brute-force defense), `bcryptjs` (password hashing), and strictly-typed `multer` (MIME image verification).
- **Authentication:** Stateless authentication via `jsonwebtoken`.

---

## ✨ System Features

### 1. Dynamic Portfolio Engine
Projects and interior design portfolios are no longer hardcoded. The application programmatically draws layout structures, challenge/solution narratives, and curated image galleries directly from the SQLite database.

### 2. Multi-User Admin Dashboard (`/admin`)
Authorized users can log in dynamically to modify the website directly:
- **Project Editor:** An interactive UI allowing complete CRUD capabilities over the portfolio, backed by realtime image-preview rendering.
- **Inquiry Capture:** A centralized hub to catch, review, and act upon email form submissions.

### 3. Invisible Analytics System
Custom telemetry pinging allows the server to secretly record:
- Total unique visitors mapped via secure Visitor ID tokens.
- Total average duration of sessions via continuous `fetch(keepalive)` beacons.
- Geolocation tracking by isolating public IP traces.

---

## 🛠️ Local Development & Setup

1. **Clone the Repository:**
```bash
git clone https://github.com/yourusername/aqilah_website.git
cd aqilah_website
```

2. **Establish the Environment:**
Create a `.env` file in the core root directory containing:
```env
PORT=8080
JWT_SECRET=your_super_secret_unique_string_here
```

3. **Install Dependencies:**
```bash
# This will pull Express, Helmet, SQLite3, Bcrypt, Multer, etc.
npm install
```

4. **Launch the Server:**
```bash
node server.js
```
*The website will seamlessly initialize on `http://localhost:8080`.*

---

## 🌐 Production Deployment (cPanel / Shared Hosting)

1. Package all files into a `.zip` **(Excluding `node_modules` and `.git`)**.
2. Upload and extract via the cPanel File Manager.
3. Access **Setup Node.js App** through your cPanel dashboard.
4. Set the **Application startup file** to `server.js` and add your `JWT_SECRET` variable.
5. Click **Run NPM Install**, followed by **Start App**.

*Note: Shared Hosts running Phusion Passenger will dynamically wire the internal `PORT` variable. You do not need an Nginx configuration.*

---

### Author
Designed and Engineered specifically for **Home with Aqilah's** premium stylistic and architectural brand intent.
