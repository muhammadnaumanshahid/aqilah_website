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
            if (res.status === 401) {
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
    
    // Inject Gallery Fields (10 images)
    if (galleryManager) {
        galleryManager.innerHTML = '';
        for(let i=0; i<10; i++) {
            galleryManager.innerHTML += '<div class="border p-2 rounded bg-gray-50">' +
                '<label class="block font-medium mb-1 text-xs">Image ' + (i+1) + '</label>' +
                '<img id="gallery_preview_' + i + '" src="" class="h-16 w-auto object-cover rounded mb-2 hidden border">' +
                '<div class="flex gap-1 mb-2">' +
                    '<input type="file" id="gallery_file_' + i + '" accept="image/*" class="w-full text-[10px] border p-1 rounded">' +
                    '<button type="button" class="bg-gray-200 px-2 py-1 rounded text-[10px] whitespace-nowrap hover:bg-gray-300 transition select-media-btn" data-target-existing="gallery_existing_' + i + '" data-target-preview="gallery_preview_' + i + '" data-target-file="gallery_file_' + i + '"><i class="fas fa-folder-open"></i> Media</button>' +
                '</div>' +
                '<input type="text" id="gallery_caption_' + i + '" placeholder="Caption ' + (i+1) + '" class="w-full border p-1 rounded text-xs">' +
                '<input type="hidden" id="gallery_existing_' + i + '">' +
            '</div>';
        }
    }

    document.getElementById('add-project-btn').addEventListener('click', () => {
        projectForm.reset();
        document.getElementById('project-id').value = '';
        document.getElementById('modal-title').textContent = 'Add Portfolio Item';
        document.getElementById('main_existing_image').value = '';
        document.getElementById('main-image-preview').classList.add('hidden');
        document.getElementById('main-image-preview').src = '';
        for (let i=0; i<10; i++) {
            document.getElementById(`gallery_existing_${i}`).value = '';
            const gPrev = document.getElementById(`gallery_preview_${i}`);
            gPrev.classList.add('hidden');
            gPrev.src = '';
        }
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

        for(let i=0; i<10; i++) {
            const caption = document.getElementById(`gallery_caption_${i}`).value;
            const existing = document.getElementById(`gallery_existing_${i}`).value;
            const fileInput = document.getElementById(`gallery_file_${i}`);
            
            contentJson.gallery.push({ image: existing, caption: caption });
            if (fileInput.files[0]) {
                formData.append(`gallery_image_${i}`, fileInput.files[0]);
            }
        }
        
        formData.append('content', JSON.stringify(contentJson));
        
        
        formData.append('existing_image', document.getElementById('main_existing_image').value);
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
            tr.dataset.id = p.id;
            tr.innerHTML = `
                <td class="p-3 w-8 cursor-grab drag-handle text-gray-400" title="Drag to reorder">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                    </svg>
                </td>
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

        // Wire drag-and-drop reordering via SortableJS
        if (window.Sortable && tbody) {
            if (tbody._sortable) tbody._sortable.destroy();
            tbody._sortable = new Sortable(tbody, {
                animation: 150,
                handle: '.drag-handle',
                ghostClass: 'bg-blue-50',
                onEnd: async () => {
                    const rows = [...tbody.querySelectorAll('tr[data-id]')];
                    const order = rows.map((row, idx) => ({ id: parseInt(row.dataset.id), sort_order: idx + 1 }));
                    await _fetch('/api/projects/reorder', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(order)
                    });
                }
            });
        }

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
        document.getElementById('main_existing_image').value = project.main_image || '';
        
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
            
            for (let i=0; i<10; i++) {
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
        const fields = [
            'smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'recipient_email', 
            'ga_tracking_id', 'recaptcha_site_key', 'recaptcha_secret_key'
        ];
        fields.forEach(f => {
            const el = document.getElementById(`setting_${f}`);
            if (el && settings[f]) {
                if (f === 'smtp_pass' || f === 'recaptcha_secret_key') el.value = ''; // Don't expose password, let them overwrite
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

    const integrationsForm = document.getElementById('integrations-form');
    if (integrationsForm) {
        integrationsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const updates = { 
                ga_tracking_id: document.getElementById('setting_ga_tracking_id').value.trim(),
                recaptcha_site_key: document.getElementById('setting_recaptcha_site_key').value.trim()
            };
            const secretKey = document.getElementById('setting_recaptcha_secret_key').value.trim();
            if (secretKey) updates.recaptcha_secret_key = secretKey; // Only update if typed

            await _fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            
            const msg = document.getElementById('integrations-message');
            msg.classList.remove('hidden');
            setTimeout(() => msg.classList.add('hidden'), 3000);
        });
    }

    // --- STANDALONE MEDIA MANAGEMENT LOGIC ---
    const managementGrid = document.getElementById('management-grid');
    const managementBreadcrumbs = document.getElementById('management-breadcrumbs');
    const managementPathDisplay = document.getElementById('management-path-display');
    const managementUploadInput = document.getElementById('management-upload-input');
    const managementUploadOverlay = document.getElementById('management-upload-overlay');
    let currentManagementPath = '';

    document.querySelectorAll('.nav-link[data-target="media-management-view"]').forEach(b => {
        b.addEventListener('click', () => loadManagementMedia(''));
    });

    async function loadManagementMedia(pathStr) {
        currentManagementPath = pathStr;
        const res = await _fetch(`/api/media?dir=${encodeURIComponent(pathStr)}`);
        const data = await res.json();
        
        const parts = pathStr.split('/').filter(p => p);
        let breadHtml = `<button class="text-blue-600 hover:underline hover:text-blue-800 mgt-crumb" data-path="">/images</button>`;
        let runningPath = '';
        parts.forEach(p => {
            runningPath += (runningPath ? '/' : '') + p;
            breadHtml += ` <span class="text-gray-400">/</span> <button class="text-blue-600 hover:underline hover:text-blue-800 mgt-crumb" data-path="${runningPath}">${p}</button>`;
        });
        managementBreadcrumbs.innerHTML = breadHtml;

        document.querySelectorAll('.mgt-crumb').forEach(b => {
            b.addEventListener('click', (e) => loadManagementMedia(e.target.dataset.path));
        });

        let gridHtml = '';
        data.folders.forEach(f => {
            const fPath = pathStr ? `${pathStr}/${f}` : f;
            gridHtml += `
                <div class="bg-white border rounded p-4 text-center cursor-pointer hover:shadow-md transition mgt-folder" data-path="${fPath}">
                    <i class="fas fa-folder text-5xl text-yellow-400 mb-2"></i>
                    <p class="text-sm truncate font-medium text-gray-800">${f}</p>
                </div>`;
        });
        
        data.files.forEach(f => {
            const fPath = pathStr ? `${pathStr}/${f}` : f;
            const fullUrl = '/images/' + fPath;
            gridHtml += `
                <div class="bg-white border rounded p-2 text-center hover:shadow-md transition relative group select-none flex flex-col justify-between">
                    <div class="h-32 w-full bg-gray-100 flex items-center justify-center rounded overflow-hidden mb-2 relative">
                        <img src="${fullUrl}" class="max-h-full max-w-full object-contain">
                    </div>
                    <p class="text-[11px] truncate font-medium text-gray-700 select-all" title="${f}">${f}</p>
                    <p class="text-[9px] truncate text-gray-400 mt-1 select-all" title="${fullUrl}">${fullUrl}</p>
                    <a href="${fullUrl}" target="_blank" class="absolute inset-0 z-10 hidden group-hover:block" title="View Image"></a>
                </div>`;
        });
        
        if (data.folders.length === 0 && data.files.length === 0) {
           gridHtml = `<div class="col-span-full flex flex-col items-center justify-center py-20 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
               <i class="fas fa-folder-open text-4xl mb-3 text-gray-300"></i>
               <p>This folder is currently empty.</p>
           </div>`;
        }
        
        managementGrid.innerHTML = gridHtml;
        const defaultPath = currentManagementPath ? `/images/${currentManagementPath}` : '/images';
        if (managementPathDisplay) managementPathDisplay.textContent = defaultPath;
        
        document.querySelectorAll('.mgt-folder').forEach(el => {
            el.addEventListener('click', () => loadManagementMedia(el.dataset.path));
        });
    }

    const mgtNewFolderBtn = document.getElementById('management-new-folder-btn');
    if (mgtNewFolderBtn) {
        mgtNewFolderBtn.addEventListener('click', async () => {
            const name = prompt('Enter new folder name:');
            if (!name) return;
            const res = await _fetch('/api/media/folder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dir: currentManagementPath, name })
            });
            if (res.ok) loadManagementMedia(currentManagementPath);
            else alert('Failed to create folder');
        });
    }

    const mgtUploadBtn = document.getElementById('management-upload-btn');
    if (mgtUploadBtn && managementUploadInput) {
        mgtUploadBtn.addEventListener('click', () => managementUploadInput.click());
        managementUploadInput.addEventListener('change', async () => {
            if (managementUploadInput.files.length === 0) return;
            managementUploadOverlay.classList.remove('hidden');
            
            const formData = new FormData();
            formData.append('dir', currentManagementPath);
            for (let i = 0; i < managementUploadInput.files.length; i++) {
                formData.append('files', managementUploadInput.files[i]);
            }
            
            try {
                const res = await _fetch('/api/media/upload', {
                    method: 'POST',
                    body: formData
                });
                if (!res.ok) {
                    const data = await res.json();
                    alert(data.error || 'Upload failed');
                }
            } catch (e) {
                alert('Upload failed');
            }
            
            managementUploadInput.value = '';
            managementUploadOverlay.classList.add('hidden');
            loadManagementMedia(currentManagementPath);
        });
    }

    // --- EXISTING MODAL MEDIA PICKER LOGIC ---
    const mediaModal = document.getElementById('media-modal');
    const mediaGrid = document.getElementById('media-grid');
    const mediaBreadcrumbs = document.getElementById('media-breadcrumbs');
    let currentMediaPath = '';
    let mediaTargetExisting = '';
    let mediaTargetPreview = '';
    let mediaTargetFile = '';

    function openMediaLibrary(targetExisting, targetPreview, targetFile) {
        mediaTargetExisting = targetExisting;
        mediaTargetPreview = targetPreview;
        mediaTargetFile = targetFile;
        loadMedia(currentMediaPath);
        mediaModal.classList.remove('hidden');
    }

    document.documentElement.addEventListener('click', e => {
        const btn = e.target.closest('.select-media-btn');
        if (btn) openMediaLibrary(btn.dataset.targetExisting, btn.dataset.targetPreview, btn.dataset.targetFile);
    });

    document.querySelectorAll('.close-media-modal').forEach(b => {
        b.addEventListener('click', () => mediaModal.classList.add('hidden'));
    });

    async function loadMedia(pathStr) {
        currentMediaPath = pathStr;
        const res = await _fetch(`/api/media?dir=${encodeURIComponent(pathStr)}`);
        const data = await res.json();
        
        // Render Breadcrumbs
        const parts = pathStr.split('/').filter(p => p);
        let breadHtml = `<button class="text-blue-500 hover:underline media-crumb" data-path="">Home</button>`;
        let runningPath = '';
        parts.forEach(p => {
            runningPath += (runningPath ? '/' : '') + p;
            breadHtml += ` / <button class="text-blue-500 hover:underline media-crumb" data-path="${runningPath}">${p}</button>`;
        });
        mediaBreadcrumbs.innerHTML = breadHtml;

        document.querySelectorAll('.media-crumb').forEach(b => {
            b.addEventListener('click', (e) => loadMedia(e.target.dataset.path));
        });

        // Render Grid
        let gridHtml = '';
        data.folders.forEach(f => {
            const fPath = pathStr ? `${pathStr}/${f}` : f;
            gridHtml += `
                <div class="bg-white border rounded p-3 text-center cursor-pointer hover:shadow hover:border-blue-300 transition media-folder" data-path="${fPath}">
                    <i class="fas fa-folder text-4xl text-yellow-500 mb-2"></i>
                    <p class="text-xs truncate font-medium text-gray-700">${f}</p>
                </div>`;
        });
        
        data.files.forEach(f => {
            const fPath = pathStr ? `${pathStr}/${f}` : f;
            const fullUrl = '/images/' + fPath;
            gridHtml += `
                <div class="bg-white border rounded p-2 text-center cursor-pointer hover:shadow hover:border-blue-500 transition media-file relative group" data-url="${fullUrl}">
                    <div class="h-24 w-full bg-gray-100 flex items-center justify-center rounded overflow-hidden mb-2">
                        <img src="${fullUrl}" class="max-h-full max-w-full object-cover">
                    </div>
                    <p class="text-[10px] truncate text-gray-600">${f}</p>
                    <div class="absolute inset-0 bg-blue-500 bg-opacity-80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center rounded transition font-medium text-sm">
                        Select
                    </div>
                </div>`;
        });
        
        if(data.folders.length === 0 && data.files.length === 0) {
           gridHtml = `<div class="col-span-full text-center py-10 text-gray-400">Empty directory</div>`;
        }
        
        mediaGrid.innerHTML = gridHtml;
        
        const pathDisplay = document.getElementById('media-path-display');
        const defaultPath = currentMediaPath ? `/images/${currentMediaPath}` : '/images';
        if (pathDisplay) pathDisplay.textContent = defaultPath;
        
        document.querySelectorAll('.media-folder').forEach(el => {
            el.addEventListener('click', () => loadMedia(el.dataset.path));
            el.addEventListener('mouseenter', () => { if(pathDisplay) pathDisplay.textContent = `/images/${el.dataset.path}`; });
            el.addEventListener('mouseleave', () => { if(pathDisplay) pathDisplay.textContent = defaultPath; });
        });

        document.querySelectorAll('.media-file').forEach(el => {
            el.addEventListener('mouseenter', () => { if(pathDisplay) pathDisplay.textContent = el.dataset.url; });
            el.addEventListener('mouseleave', () => { if(pathDisplay) pathDisplay.textContent = defaultPath; });
            
            el.addEventListener('click', () => {
                const url = el.dataset.url;
                
                const existingInput = document.getElementById(mediaTargetExisting);
                const previewImg = document.getElementById(mediaTargetPreview);
                const fileInput = document.getElementById(mediaTargetFile);
                
                if (existingInput) existingInput.value = url;
                if (previewImg) { previewImg.src = url; previewImg.classList.remove('hidden'); }
                if (fileInput) fileInput.value = ''; // clear local file if server file selected
                
                mediaModal.classList.add('hidden');
            });
        });
    }

    document.getElementById('media-new-folder-btn')?.addEventListener('click', async () => {
        const name = prompt('Enter new folder name:');
        if (!name) return;
        const res = await _fetch('/api/media/folder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dir: currentMediaPath, name })
        });
        if (res.ok) loadMedia(currentMediaPath);
        else alert('Error creating folder');
    });

    document.getElementById('media-upload-input')?.addEventListener('change', async (e) => {
        if (!e.target.files.length) return;
        const fm = new FormData();
        fm.append('dir', currentMediaPath);
        for(let f of e.target.files) fm.append('files', f);
        
        const res = await _fetch('/api/media/upload', { method: 'POST', body: fm });
        e.target.value = '';
        if (res.ok) {
            loadMedia(currentMediaPath);
        } else {
            const errBody = await res.json();
            alert('Upload error: ' + (errBody.error || 'Server rejected file'));
        }
    });

    // Clear existing server file input if a local file is picked
    document.documentElement.addEventListener('change', e => {
        if (e.target.type === 'file' && e.target.id.includes('project-image')) {
            document.getElementById('main_existing_image').value = '';
            if (e.target.files[0]) {
                const url = URL.createObjectURL(e.target.files[0]);
                const prev = document.getElementById('main-image-preview');
                prev.src = url; prev.classList.remove('hidden');
            }
        }
        if (e.target.type === 'file' && e.target.id.includes('gallery_file_')) {
            const idx = e.target.id.split('_')[2];
            document.getElementById(`gallery_existing_${idx}`).value = '';
            if (e.target.files[0]) {
                const url = URL.createObjectURL(e.target.files[0]);
                const prev = document.getElementById(`gallery_preview_${idx}`);
                prev.src = url; prev.classList.remove('hidden');
            }
        }
    });

    // --- IDLE LOGOUT LOGIC ---
    let idleTimeout;
    const IDLE_DURATION = 30 * 60 * 1000; // 30 minutes

    function resetIdleTimer() {
        if (!token) return;
        clearTimeout(idleTimeout);
        idleTimeout = setTimeout(() => {
            if (token) {
                alert("You have been automatically logged out due to inactivity.");
                logoutBtn.click();
            }
        }, IDLE_DURATION);
    }

    // Attach activity listeners
    ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(evt => {
        window.addEventListener(evt, resetIdleTimer, { passive: true });
    });

    // Initialize the timer
    resetIdleTimer();

});
