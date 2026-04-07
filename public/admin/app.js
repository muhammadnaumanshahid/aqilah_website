document.addEventListener('DOMContentLoaded', () => {
    // STATE
    let token = localStorage.getItem('adminToken');
    let inquiriesChart = null;
    
    // ELEMENTS
    const loginScreen = document.getElementById('login-screen');
    const dashboardScreen = document.getElementById('dashboard-screen');
    const mainContent = document.getElementById('main-content');
    
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    
    // CHECK LOGIN STATUS
    if (token) {
        showDashboard();
        loadOverview();
    } else {
        loginScreen.classList.remove('hidden');
    }

    // AUTH / LOGIN
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const err = document.getElementById('login-error');

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (res.ok) {
                const data = await res.json();
                token = data.token;
                localStorage.setItem('adminToken', token);
                localStorage.setItem('adminName', data.name);
                showDashboard();
                loadOverview(); // Default view
                err.classList.add('hidden');
            } else {
                err.classList.remove('hidden');
            }
        } catch (error) {
            console.error(error);
        }
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminName');
        token = null;
        dashboardScreen.classList.add('hidden');
        mainContent.classList.add('hidden');
        loginScreen.classList.remove('hidden');
        document.getElementById('login-form').reset();
    });

    function showDashboard() {
        document.getElementById('welcome-name').textContent = localStorage.getItem('adminName') || 'Admin';
        loginScreen.classList.add('hidden');
        dashboardScreen.classList.remove('hidden');
        mainContent.classList.remove('hidden');
    }

    function _fetch(url, options = {}) {
        options.headers = { ...options.headers, 'Authorization': `Bearer ${token}` };
        return fetch(url, options).then(res => {
            if (res.status === 401 || res.status === 403) {
                logoutBtn.click();
            }
            return res;
        });
    }

    // NAVIGATION
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Highlight active nav
            document.querySelectorAll('.nav-link').forEach(nav => {
                nav.classList.remove('bg-gray-800', 'text-white');
                nav.classList.add('text-gray-300');
            });
            link.classList.add('bg-gray-800', 'text-white');
            link.classList.remove('text-gray-300');

            // Show corresponding view
            document.querySelectorAll('.view-section').forEach(sec => sec.classList.add('hidden'));
            const targetId = link.getAttribute('data-target');
            document.getElementById(targetId).classList.remove('hidden');

            // Load logic
            if (targetId === 'overview-view') loadOverview();
            if (targetId === 'users-view') loadUsers();
            if (targetId === 'projects-view') loadProjects();
            if (targetId === 'inquiries-view') loadInquiries();
            if (targetId === 'settings-view') loadSettings();
        });
    });

    // --- OVERVIEW ---
    async function loadOverview() {
        const [projRes, inqRes] = await Promise.all([
            _fetch('/api/projects').then(r => r.json()),
            _fetch('/api/inquiries').then(r => r.json())
        ]);
        document.getElementById('overview-projects-count').textContent = projRes.length || 0;
        document.getElementById('overview-inquiries-count').textContent = inqRes.length || 0;
        
        renderChart(inqRes);
        loadAnalytics();
    }
    
    async function loadAnalytics() {
        try {
            const res = await _fetch('/api/analytics');
            if(!res.ok) return;
            const data = await res.json();
            
            const visitors = new Set();
            let totalDur = 0;
            let countDur = 0;
            const locations = {};
            
            data.forEach(r => {
                if (r.visitor_id) visitors.add(r.visitor_id);
                if (r.duration) { totalDur += r.duration; countDur++; }
                if (r.location && r.location !== 'Unknown') locations[r.location] = (locations[r.location] || 0) + 1;
            });
            
            const visitorsEl = document.getElementById('metric-visitors');
            if(visitorsEl) visitorsEl.textContent = visitors.size;
            
            const avg = countDur ? Math.round(totalDur / countDur) : 0;
            const mins = Math.floor(avg / 60);
            const secs = avg % 60;
            const durEl = document.getElementById('metric-duration');
            if(durEl) durEl.textContent = mins + 'm ' + secs + 's';
            
            let topLoc = '-';
            let maxCount = 0;
            for(let l in locations) {
                if (locations[l] > maxCount) { maxCount = locations[l]; topLoc = l; }
            }
            const locEl = document.getElementById('metric-location');
            if(locEl) { locEl.textContent = topLoc; locEl.title = topLoc; }
        } catch(e) { console.error('Analytics error', e); }
    }
    
    function renderChart(inquiries) {
        const ctx = document.getElementById('inquiries-chart');
        if (!ctx) return;
        
        // Group by day for the last 7 days
        const counts = {};
        for(let i=6; i>=0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            counts[d.toISOString().split('T')[0]] = 0;
        }
        
        let propTypes = {};
        inquiries.forEach(inq => {
            const dateStr = new Date(inq.date_submitted).toISOString().split('T')[0];
            if (counts[dateStr] !== undefined) counts[dateStr]++;
            
            const pt = inq.property_type || 'Unknown';
            propTypes[pt] = (propTypes[pt] || 0) + 1;
        });

        if (inquiriesChart) inquiriesChart.destroy();
        inquiriesChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(counts),
                datasets: [{
                    label: 'Inquiries Received',
                    data: Object.values(counts),
                    backgroundColor: '#1f2937',
                    borderRadius: 4
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        // Donut Chart
        const donutCtx = document.getElementById('property-type-chart');
        if (donutCtx) {
            new Chart(donutCtx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(propTypes),
                    datasets: [{
                        data: Object.values(propTypes),
                        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
                        borderWidth: 1
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, cutout: '70%' }
            });
        }
    }

    // --- USERS MANAGEMENT ---
    const userModal = document.getElementById('user-modal');
    const userForm = document.getElementById('user-form');
    
    document.getElementById('add-user-btn')?.addEventListener('click', () => {
        userForm.reset();
        document.getElementById('user-id').value = '';
        document.getElementById('user-modal-title').textContent = 'Add Team Member';
        document.getElementById('user-password').required = true;
        document.getElementById('user-pass-help').textContent = 'Required for new members.';
        userModal.classList.remove('hidden');
    });

    document.querySelectorAll('.close-user-modal').forEach(btn => {
        btn.addEventListener('click', () => userModal.classList.add('hidden'));
    });

    userForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('user-id').value;
        const name = document.getElementById('user-name').value;
        const email = document.getElementById('user-email').value;
        const password = document.getElementById('user-password').value;

        const url = id ? `/api/users/${id}` : '/api/users';
        const method = id ? 'PUT' : 'POST';
        
        await _fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        
        userModal.classList.add('hidden');
        loadUsers();
    });

    async function loadUsers() {
        const res = await _fetch('/api/users');
        const users = await res.json();
        const tbody = document.getElementById('users-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';
        
        users.forEach(u => {
            const tr = document.createElement('tr');
            tr.className = 'border-b hover:bg-gray-50';
            tr.innerHTML = `
                <td class="p-4 font-medium">${u.name}</td>
                <td class="p-4 text-gray-600">${u.email}</td>
                <td class="p-4 text-right">
                    <button class="text-blue-500 hover:underline mr-3 edit-user-btn" data-id="${u.id}">Edit</button>
                    <button class="text-red-500 hover:underline del-user-btn" data-id="${u.id}">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        document.querySelectorAll('.edit-user-btn').forEach(b => {
            b.addEventListener('click', () => {
                const u = users.find(x => x.id == b.dataset.id);
                document.getElementById('user-id').value = u.id;
                document.getElementById('user-name').value = u.name;
                document.getElementById('user-email').value = u.email;
                document.getElementById('user-password').value = '';
                document.getElementById('user-password').required = false;
                document.getElementById('user-pass-help').textContent = 'Leave blank to keep current password.';
                document.getElementById('user-modal-title').textContent = 'Edit Team Member';
                userModal.classList.remove('hidden');
            });
        });

        document.querySelectorAll('.del-user-btn').forEach(b => {
            b.addEventListener('click', async () => {
                if(confirm('Are you sure you want to remove this team member?')) {
                    await _fetch(`/api/users/${b.dataset.id}`, { method: 'DELETE' });
                    loadUsers();
                }
            });
        });
    }

    // --- PROJECTS MANAGMENT ---
    const projectModal = document.getElementById('project-modal');
    const projectForm = document.getElementById('project-form');
    const galleryManager = document.getElementById('gallery-manager');
    
    // Inject Gallery Fields
    if (galleryManager) {
        galleryManager.innerHTML = '';
        for(let i=0; i<4; i++) {
            galleryManager.innerHTML += '<div class="border p-2 rounded bg-gray-50">' +
                '<label class="block font-medium mb-1">Image ' + (i+1) + '</label>' +
                '<img id="gallery_preview_' + i + '" src="" class="h-16 w-auto object-cover rounded mb-2 hidden border">' +
                '<input type="file" id="gallery_file_' + i + '" accept="image/*" class="w-full mb-2 text-xs">' +
                '<input type="text" id="gallery_caption_' + i + '" placeholder="Caption ' + (i+1) + '" class="w-full border p-1 rounded text-xs">' +
                '<input type="hidden" id="gallery_existing_' + i + '">' +
            '</div>';
        }
    }

    document.getElementById('add-project-btn').addEventListener('click', () => {
        projectForm.reset();
        document.getElementById('project-id').value = '';
        document.getElementById('modal-title').textContent = 'Add Portfolio Item';
        for (let i=0; i<4; i++) document.getElementById(`gallery_existing_${i}`).value = '';
        projectModal.classList.remove('hidden');
    });

    document.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            projectModal.classList.add('hidden');
        });
    });

    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('project-id').value;
        
        const formData = new FormData();
        formData.append('title', document.getElementById('project-title').value);
        formData.append('location', document.getElementById('project-location').value);
        
        const contentJson = {
            scope: document.getElementById('meta-scope').value,
            style: document.getElementById('meta-style').value,
            timeline: document.getElementById('meta-timeline').value,
            challenge: document.getElementById('narrative-challenge').value,
            solution: document.getElementById('narrative-solution').value,
            testimonial: {
                quote: document.getElementById('testi-quote').value,
                client: document.getElementById('testi-name').value
            },
            gallery: []
        };

        for(let i=0; i<4; i++) {
            const caption = document.getElementById(`gallery_caption_${i}`).value;
            const existing = document.getElementById(`gallery_existing_${i}`).value;
            const fileInput = document.getElementById(`gallery_file_${i}`);
            
            contentJson.gallery.push({ image: existing, caption: caption });
            if (fileInput.files[0]) {
                formData.append(`gallery_image_${i}`, fileInput.files[0]);
            }
        }
        
        formData.append('content', JSON.stringify(contentJson));
        
        const fileInput = document.getElementById('project-image');
        if (fileInput.files[0]) {
            formData.append('main_image', fileInput.files[0]);
        }
        
        const url = id ? `/api/projects/${id}` : '/api/projects';
        const method = id ? 'PUT' : 'POST';

        await _fetch(url, { method, body: formData });
        projectModal.classList.add('hidden');
        loadProjects();
    });

    async function loadProjects() {
        const res = await _fetch('/api/projects');
        const projects = await res.json();
        const tbody = document.getElementById('projects-table-body');
        tbody.innerHTML = '';
        
        projects.forEach(p => {
            const tr = document.createElement('tr');
            tr.className = 'border-b';
            tr.innerHTML = `
                <td class="p-4"><img src="${p.main_image}" class="w-12 h-12 object-cover rounded bg-gray-100" /></td>
                <td class="p-4 font-medium">${p.title}</td>
                <td class="p-4 text-gray-600">${p.location}</td>
                <td class="p-4 text-right">
                    <button class="text-blue-500 hover:underline mr-3 edit-btn" data-id="${p.id}">Edit</button>
                    <button class="text-red-500 hover:underline del-btn" data-id="${p.id}">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Attach listeners
        document.querySelectorAll('.edit-btn').forEach(b => {
            b.addEventListener('click', () => editProject(b.dataset.id, projects));
        });
        document.querySelectorAll('.del-btn').forEach(b => {
            b.addEventListener('click', async () => {
                if(confirm('Are you sure you want to delete this project?')) {
                    await _fetch(`/api/projects/${b.dataset.id}`, { method: 'DELETE' });
                    loadProjects();
                }
            });
        });
    }

    function editProject(id, projects) {
        const project = projects.find(p => p.id == id);
        if (!project) return;
        document.getElementById('project-id').value = project.id;
        document.getElementById('project-title').value = project.title;
        document.getElementById('project-location').value = project.location;
        document.getElementById('project-image').value = ''; 
        
        const mainPrev = document.getElementById('main-image-preview');
        if (mainPrev) {
            if (project.main_image) {
                mainPrev.src = project.main_image;
                mainPrev.classList.remove('hidden');
            } else {
                mainPrev.src = '';
                mainPrev.classList.add('hidden');
            }
        }
        
        projectForm.reset(); 
        document.getElementById('project-title').value = project.title;
        document.getElementById('project-location').value = project.location;
        
        try {
            const c = JSON.parse(project.content);
            document.getElementById('meta-scope').value = c.scope || '';
            document.getElementById('meta-style').value = c.style || '';
            document.getElementById('meta-timeline').value = c.timeline || '';
            document.getElementById('narrative-challenge').value = c.challenge || '';
            document.getElementById('narrative-solution').value = c.solution || '';
            if (c.testimonial) {
                document.getElementById('testi-quote').value = c.testimonial.quote || '';
                document.getElementById('testi-name').value = c.testimonial.client || '';
            }
            
            for (let i=0; i<4; i++) {
                const prev = document.getElementById('gallery_preview_' + i);
                if (c.gallery && c.gallery[i]) {
                    document.getElementById('gallery_caption_' + i).value = c.gallery[i].caption || '';
                    document.getElementById('gallery_existing_' + i).value = c.gallery[i].image || '';
                    if (c.gallery[i].image && prev) {
                        prev.src = c.gallery[i].image;
                        prev.classList.remove('hidden');
                    } else if (prev) {
                        prev.classList.add('hidden');
                    }
                } else {
                    document.getElementById('gallery_caption_' + i).value = '';
                    document.getElementById('gallery_existing_' + i).value = '';
                    if (prev) prev.classList.add('hidden');
                }
            }
        } catch(e) {
            console.error("Content is not JSON", e);
        }

        document.getElementById('modal-title').textContent = 'Edit Portfolio Item';
        projectModal.classList.remove('hidden');
    }

    // --- INQUIRIES MANAGMENT ---
    async function loadInquiries() {
        const res = await _fetch('/api/inquiries');
        const inquiries = await res.json();
        const tbody = document.getElementById('inquiries-table-body');
        tbody.innerHTML = '';
        
        inquiries.forEach(i => {
            const date = new Date(i.date_submitted).toLocaleString();
            const tr = document.createElement('tr');
            const isNew = i.status === 'new';
            tr.className = `border-b hover:bg-gray-50 ${isNew ? 'bg-green-50' : ''}`;
            tr.innerHTML = `
                <td class="p-4 align-top text-xs">${date}</td>
                <td class="p-4 align-top">
                    <span class="font-medium">${i.name}</span><br>
                    <span class="text-xs text-gray-500">Property: ${i.property_type}</span><br>
                    <span class="text-xs text-gray-500">Budget: ${i.budget}</span><br>
                    <span class="text-xs text-gray-500">Timeline: ${i.timeline}</span>
                </td>
                <td class="p-4 align-top text-gray-600">
                    <a href="mailto:${i.email}" class="text-blue-500 hover:underline">${i.email}</a><br>
                    ${i.phone}
                </td>
                <td class="p-4 align-top">
                    ${isNew 
                        ? '<span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">New</span>' 
                        : '<span class="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">Read</span>'}
                </td>
                <td class="p-4 text-right align-top">
                    <button class="text-blue-500 hover:underline mr-3 toggle-status-btn" data-id="${i.id}" data-status="${i.status}">
                        ${isNew ? 'Mark Read' : 'Unread'}
                    </button>
                    <button class="text-red-500 hover:underline del-inq-btn" data-id="${i.id}">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        document.querySelectorAll('.del-inq-btn').forEach(b => {
            b.addEventListener('click', async () => {
                if(confirm('Delete this inquiry permanently?')) {
                    await _fetch(`/api/inquiries/${b.dataset.id}`, { method: 'DELETE' });
                    loadInquiries();
                }
            });
        });
        
        document.querySelectorAll('.toggle-status-btn').forEach(b => {
            b.addEventListener('click', async () => {
                const newStatus = b.dataset.status === 'new' ? 'read' : 'new';
                await _fetch(`/api/inquiries/${b.dataset.id}`, { 
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                });
                loadInquiries();
            });
        });
    }

    // Export CSV
    const exportBtn = document.getElementById('export-csv-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', async () => {
            const res = await _fetch('/api/inquiries');
            const inquiries = await res.json();
            if (inquiries.length === 0) return alert('No inquiries to export.');
            
            const headers = ['Date', 'Name', 'Email', 'Phone', 'Property Type', 'Budget', 'Timeline', 'Status'];
            const rows = inquiries.map(i => [
                new Date(i.date_submitted).toLocaleString().replace(/,/g, ''),
                i.name, i.email, i.phone, i.property_type, i.budget, i.timeline, i.status
            ]);
            
            const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "inquiries_export.csv");
            link.click();
        });
    }

    // --- SETTINGS MANGEMENT ---
    async function loadSettings() {
        const res = await _fetch('/api/settings');
        const settings = await res.json();
        const fields = ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'recipient_email'];
        fields.forEach(f => {
            const el = document.getElementById(`setting_${f}`);
            if (el && settings[f]) {
                if (f === 'smtp_pass') el.value = ''; // Don't expose password, let them overwrite
                else el.value = settings[f];
            }
        });
    }

    document.getElementById('settings-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const updates = {};
        const fields = ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'recipient_email'];
        fields.forEach(f => {
            const val = document.getElementById(`setting_${f}`).value;
            if (val) updates[f] = val; // Only update non-empty (to preserve password)
        });

        await _fetch('/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        
        const msg = document.getElementById('settings-message');
        msg.classList.remove('hidden');
        setTimeout(() => msg.classList.add('hidden'), 3000);
    });
});
