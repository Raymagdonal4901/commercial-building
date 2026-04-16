const API_URL = '/api';
let authToken = localStorage.getItem('admin_token');
let siteContent = {};

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const adminPanel = document.getElementById('admin-panel');
const loginForm = document.getElementById('login-form');
const pwdInput = document.getElementById('password');
const loginError = document.getElementById('login-error');
const btnLogout = document.getElementById('btn-logout');
const btnSave = document.getElementById('btn-save');
const saveToast = document.getElementById('save-toast');
const visitorCountAdmin = document.getElementById('admin-visitor-count');
const navItems = document.querySelectorAll('.sidebar-nav .nav-item:not(.logout)');
const editSections = document.querySelectorAll('.edit-section');
const pageTitle = document.getElementById('page-title');

// Initialize
if (authToken) {
    showAdminPanel();
    loadContent();
}

// =========================================
// Loading & Saving Content
// =========================================
async function loadContent() {
    try {
        const res = await fetch(`${API_URL}/content`);
        if (!res.ok) throw new Error('Fetch failed');
        siteContent = await res.json();
        
        populateForms();
        visitorCountAdmin.textContent = siteContent.visitorCount || 0;
    } catch (err) {
        console.error('Failed to load content:', err);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    }
}

async function saveContent() {
    try {
        btnSave.disabled = true;
        btnSave.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg> กำลังบันทึก...';
        
        // Gather data from forms
        gatherFormData();
        
        const res = await fetch(`${API_URL}/content`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(siteContent)
        });
        
        if (!res.ok) {
            if (res.status === 401) return handleLogout();
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || 'Save failed');
        }
        
        // Show success
        saveToast.hidden = false;
        setTimeout(() => saveToast.hidden = true, 3000);
        
    } catch (err) {
        console.error('Save error:', err);
        alert(`บันทึกข้อมูลไม่สำเร็จ: ${err.message}`);
    } finally {
        btnSave.disabled = false;
        btnSave.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg> บันทึกทั้งหมด';
    }
}

// =========================================
// Form Binding
// =========================================
function populateForms() {
    // Simple text inputs
    const textFields = [
        'heroTitle', 'heroTitleGold', 'heroTitleSuffix', 'heroBadge', 'heroSubtitle',
        'priceLabel', 'priceValue', 'priceTag',
        'stripPrice', 'stripTransfer', 'stripUsage',
        'contactTitle', 'contactSubtitle', 'phoneNumber', 'lineId', 'footerText'
    ];
    
    textFields.forEach(field => {
        const el = document.getElementById(`edit-${field}`);
        if (el && siteContent[field] !== undefined) {
            el.value = siteContent[field];
        }
    });

    // Lists
    renderDetails(siteContent.details || []);
    renderHighlights(siteContent.highlights || []);
    renderNearby(siteContent.nearbyCategories || []);
    renderGallery(siteContent.galleryImages || []);
}

function gatherFormData() {
    const textFields = [
        'heroTitle', 'heroTitleGold', 'heroTitleSuffix', 'heroBadge', 'heroSubtitle',
        'priceLabel', 'priceValue', 'priceTag',
        'stripPrice', 'stripTransfer', 'stripUsage',
        'contactTitle', 'contactSubtitle', 'phoneNumber', 'lineId', 'footerText'
    ];
    
    textFields.forEach(field => {
        const el = document.getElementById(`edit-${field}`);
        if (el) siteContent[field] = el.value;
    });

    // Gather Details
    siteContent.details = Array.from(document.querySelectorAll('#details-list .list-item')).map(item => ({
        value: item.querySelector('.detail-val').value,
        unit: item.querySelector('.detail-unit').value,
        label: item.querySelector('.detail-lbl').value
    }));

    // Gather Highlights
    siteContent.highlights = Array.from(document.querySelectorAll('#highlights-list .list-item')).map(item => ({
        title: item.querySelector('.hl-title').value,
        description: item.querySelector('.hl-desc').value,
        tag: item.querySelector('.hl-tag').value,
        isPrimary: item.querySelector('.hl-primary').checked
    }));

    // Gather Nearby
    siteContent.nearbyCategories = Array.from(document.querySelectorAll('#nearby-list .list-item')).map(item => {
        const title = item.querySelector('.cat-title').value;
        const iconType = item.querySelector('.cat-icon').value;
        const subItems = Array.from(item.querySelectorAll('.nearby-sub-item')).map(sub => ({
            name: sub.querySelector('.sub-name').value,
            type: sub.querySelector('.sub-type').value
        }));
        return { title, iconType, items: subItems };
    });
}

// =========================================
// Dynamic Lists Renderers
// =========================================
function renderDetails(items) {
    const list = document.getElementById('details-list');
    list.innerHTML = '';
    items.forEach((item, index) => {
        const el = document.createElement('div');
        el.className = 'list-item';
        el.innerHTML = `
            <div class="list-item-header">
                <span class="list-item-title">รายละเอียด #${index + 1}</span>
                <button class="btn-remove" onclick="this.closest('.list-item').remove()">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg> ลบ
                </button>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>หัวข้อ (Label)</label>
                    <input type="text" class="detail-lbl" value="${item.label || ''}" placeholder="เช่น เนื้อที่">
                </div>
                <div class="form-group">
                    <label>ค่า (Value)</label>
                    <input type="text" class="detail-val" value="${item.value || ''}" placeholder="เช่น 20.7">
                </div>
                <div class="form-group">
                    <label>หน่วย (Unit) *ไม่บังคับ</label>
                    <input type="text" class="detail-unit" value="${item.unit || ''}" placeholder="เช่น ตร.ว.">
                </div>
            </div>
        `;
        list.appendChild(el);
    });
}

function renderHighlights(items) {
    const list = document.getElementById('highlights-list');
    list.innerHTML = '';
    items.forEach((item, index) => {
        const el = document.createElement('div');
        el.className = 'list-item';
        el.innerHTML = `
            <div class="list-item-header">
                <span class="list-item-title">จุดเด่น #${index + 1}</span>
                <button class="btn-remove" onclick="this.closest('.list-item').remove()">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg> ลบ
                </button>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>หัวข้อจุดเด่น</label>
                    <input type="text" class="hl-title" value="${item.title || ''}" placeholder="เช่น เดินทางสะดวก">
                </div>
                <div class="form-group">
                    <label>ป้ายกำกับ (Tag)</label>
                    <input type="text" class="hl-tag" value="${item.tag || ''}" placeholder="เช่น ทำเลทอง">
                </div>
                <div class="form-group full-width">
                    <label>รายละเอียด</label>
                    <textarea class="hl-desc">${item.description || ''}</textarea>
                </div>
                <div class="form-group full-width">
                    <div class="checkbox-group">
                        <input type="checkbox" class="hl-primary" id="hl-pri-${index}" ${item.isPrimary ? 'checked' : ''}>
                        <label for="hl-pri-${index}">ตั้งเป็นการ์ดขนาดใหญ่ (Primary Card)</label>
                    </div>
                </div>
            </div>
        `;
        list.appendChild(el);
    });
}

function renderNearby(categories) {
    const list = document.getElementById('nearby-list');
    list.innerHTML = '';
    categories.forEach((cat, index) => {
        const el = document.createElement('div');
        el.className = 'list-item';
        
        let itemsHtml = '';
        if (cat.items) {
            cat.items.forEach(sub => {
                itemsHtml += `
                    <div class="nearby-sub-item">
                        <input type="text" class="sub-name" value="${sub.name || ''}" placeholder="ชื่อสถานที่">
                        <input type="text" class="sub-type" value="${sub.type || ''}" placeholder="ประเภท (เช่น ห้างสรรพสินค้า)">
                        <button class="btn-remove-small" title="ลบสถานที่นี้" onclick="this.closest('.nearby-sub-item').remove()">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                    </div>
                `;
            });
        }

        el.innerHTML = `
            <div class="list-item-header">
                <span class="list-item-title">หมวดหมู่ #${index + 1}</span>
                <button class="btn-remove" onclick="this.closest('.list-item').remove()">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg> ลบหมวดหมู่นี้
                </button>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>ชื่อหมวดหมู่</label>
                    <input type="text" class="cat-title" value="${cat.title || ''}" placeholder="เช่น การเดินทาง">
                </div>
                <div class="form-group">
                    <label>ไอคอน</label>
                    <select class="cat-icon">
                        <option value="transport" ${cat.iconType === 'transport' ? 'selected' : ''}>การเดินทาง (รถยนต์/รถไฟ)</option>
                        <option value="shopping" ${cat.iconType === 'shopping' ? 'selected' : ''}>ช้อปปิ้ง (ถุงช้อป)</option>
                        <option value="school" ${cat.iconType === 'school' ? 'selected' : ''}>โรงเรียน (หมวกปริญญา)</option>
                        <option value="hospital" ${cat.iconType === 'hospital' ? 'selected' : ''}>โรงพยาบาล (กากบาท)</option>
                    </select>
                </div>
            </div>
            <div class="nearby-items-list">
                <div class="sub-items-container">${itemsHtml}</div>
                <button class="btn-add-small" onclick="addNearbySubItem(this)">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> เพิ่มสถานที่
                </button>
            </div>
        `;
        list.appendChild(el);
    });
}

function renderGallery(images) {
    const grid = document.getElementById('admin-gallery-grid');
    grid.innerHTML = '';
    
    // Default hero image (can't delete in gallery, it's tied to hero)
    // Actually, hero image is static for now. If we want it editable, we should add it.
    // For now we just show uploaded gallery images.
    images.forEach((imgData, i) => {
        const url = typeof imgData === 'object' && imgData !== null ? (imgData.url || imgData.image || imgData.src || '') : imgData;
        if (!url) return;

        const el = document.createElement('div');
        el.className = 'admin-gallery-item';
        el.innerHTML = `
            <img src="${url}" alt="Gallery ${i}">
            <button class="gallery-remove" onclick="deleteGalleryImage(${i})" title="ลบภาพนี้">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
        `;
        grid.appendChild(el);
    });
}

// Add New Buttons
document.getElementById('btn-add-detail').addEventListener('click', () => {
    siteContent.details = siteContent.details || [];
    siteContent.details.push({ value: '', unit: '', label: '' });
    renderDetails(siteContent.details);
});

document.getElementById('btn-add-highlight').addEventListener('click', () => {
    siteContent.highlights = siteContent.highlights || [];
    siteContent.highlights.push({ title: '', description: '', tag: '', isPrimary: false });
    renderHighlights(siteContent.highlights);
});

document.getElementById('btn-add-nearby-cat').addEventListener('click', () => {
    siteContent.nearbyCategories = siteContent.nearbyCategories || [];
    siteContent.nearbyCategories.push({ title: 'หมวดหมู่ใหม่', iconType: 'transport', items: [] });
    renderNearby(siteContent.nearbyCategories);
});

window.addNearbySubItem = function(btn) {
    const container = btn.previousElementSibling;
    const el = document.createElement('div');
    el.className = 'nearby-sub-item';
    el.innerHTML = `
        <input type="text" class="sub-name" placeholder="ชื่อสถานที่">
        <input type="text" class="sub-type" placeholder="ประเภท (เช่น ห้างสรรพสินค้า)">
        <button class="btn-remove-small" title="ลบสถานที่นี้" onclick="this.remove()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
    `;
    // change the inline onclick above to actually remove the closest item:
    el.querySelector('.btn-remove-small').onclick = function() { el.remove(); };
    container.appendChild(el);
}

// =========================================
// Gallery Upload Logic
// =========================================
const adminUploadZone = document.getElementById('admin-upload-zone');
const adminFileInput = document.getElementById('admin-file-input');

adminUploadZone.addEventListener('click', () => adminFileInput.click());

adminUploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    adminUploadZone.style.borderColor = 'var(--gold-500)';
    adminUploadZone.style.background = 'rgba(212, 175, 55, 0.04)';
});

adminUploadZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    adminUploadZone.style.borderColor = '';
    adminUploadZone.style.background = '';
});

adminUploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    adminUploadZone.style.borderColor = '';
    adminUploadZone.style.background = '';
    handleAdminUpload(e.dataTransfer.files);
});

adminFileInput.addEventListener('change', (e) => {
    handleAdminUpload(e.target.files);
    adminFileInput.value = '';
});

function handleAdminUpload(files) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const validFiles = Array.from(files).filter(f => validTypes.includes(f.type));
    
    if (validFiles.length === 0) return;
    
    // Simply read as base64 and upload via API
    // Actually, saving base64 directly to MongoDB is fine for this use case since we set 50mb limit
    validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            resizeImage(e.target.result, 1200, async (base64) => {
                try {
                    const res = await fetch(`${API_URL}/gallery`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`
                        },
                        body: JSON.stringify({ image: base64 })
                    });
                    if (res.ok) {
                        const data = await res.json();
                        siteContent.galleryImages = data.galleryImages;
                        renderGallery(siteContent.galleryImages);
                    }
                } catch (err) {
                    console.error('Gallery upload failed', err);
                }
            });
        };
        reader.readAsDataURL(file);
    });
}

function resizeImage(dataUrl, maxWidth, callback) {
    const img = new Image();
    img.onload = () => {
        let width = img.width, height = img.height;
        if (width > maxWidth) {
            height = Math.round(height * (maxWidth / width));
            width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.src = dataUrl;
}

window.deleteGalleryImage = async function(index) {
    if (!confirm('ยืนยันลบรูปภาพนี้?')) return;
    try {
        const res = await fetch(`${API_URL}/gallery/${index}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (res.ok) {
            const data = await res.json();
            siteContent.galleryImages = data.galleryImages;
            renderGallery(siteContent.galleryImages);
        }
    } catch (err) {
        console.error('Failed to delete image', err);
    }
}

// =========================================
// UI Logic & Auth Login
// =========================================
function showAdminPanel() {
    loginScreen.hidden = true;
    adminPanel.hidden = false;
}

function handleLogout() {
    localStorage.removeItem('admin_token');
    authToken = null;
    loginScreen.hidden = false;
    adminPanel.hidden = true;
    pwdInput.value = '';
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.hidden = true;
    const text = pwdInput.value;
    
    try {
        const res = await fetch(`${API_URL}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: text })
        });
        
        const data = await res.json();
        if (data.success) {
            authToken = data.token;
            localStorage.setItem('admin_token', authToken);
            showAdminPanel();
            loadContent();
        } else {
            loginError.hidden = false;
            loginError.textContent = data.error;
        }
    } catch (err) {
        console.error(err);
        loginError.hidden = false;
        loginError.textContent = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์';
    }
});

btnLogout.addEventListener('click', (e) => {
    e.preventDefault();
    handleLogout();
});

btnSave.addEventListener('click', saveContent);

// Nav handling
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        pageTitle.textContent = item.textContent.trim();
        
        editSections.forEach(sec => sec.classList.remove('active'));
        document.getElementById(item.dataset.section).classList.add('active');
    });
});
