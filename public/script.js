// =========================================
// API & Data Fetching
// =========================================
const API_URL = '/api';

async function fetchSiteContent() {
    try {
        const res = await fetch(`${API_URL}/content`);
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        populateContent(data);
    } catch (error) {
        console.error('Error fetching content:', error);
    }
}

function populateContent(data) {
    // 1. Text Elements
    const fields = [
        'heroBadge', 'heroTitle', 'heroTitleGold', 'heroTitleSuffix', 'heroSubtitle',
        'priceLabel', 'priceValue', 'priceTag',
        'stripPrice', 'stripTransfer', 'stripUsage',
        'contactTitle', 'contactSubtitle', 'footerText'
    ];

    fields.forEach(f => {
        const el = document.getElementById(`dyn-${f}`);
        if (el && data[f]) el.textContent = data[f];
    });

    // Handle Links/Phone
    const btnCall = document.getElementById('btn-call');
    if (btnCall && data.phoneNumber) {
        btnCall.href = `tel:${data.phoneNumber.replace(/\D/g,'')}`;
        btnCall.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg> ${data.phoneNumber}`;
    }
    const btnLine = document.getElementById('btn-line');
    if (btnLine && data.lineId) {
        // Simple check if it's a URL or ID
        const href = data.lineId.startsWith('http') ? data.lineId : `https://line.me/ti/p/~${data.lineId.replace('@', '')}`;
        btnLine.href = href;
        
        // Use the lineId or format it with @
        const displayText = data.lineId.startsWith('http') ? 'Add LINE' : (data.lineId.startsWith('@') ? data.lineId : `@${data.lineId}`);
        btnLine.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> ${displayText}`;
    }

    // 2. Details Grid
    const detailsGrid = document.getElementById('dyn-details-grid');
    if (detailsGrid && data.details) {
        detailsGrid.innerHTML = '';
        data.details.forEach((d, index) => {
            const icons = [
                '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/>',
                '<rect x="4" y="2" width="16" height="20" rx="1"/><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/>',
                '<path d="M4 22V6a2 2 0 012-2h5v4h6V4h1a2 2 0 012 2v16"/><path d="M9 22v-4h6v4"/><circle cx="12" cy="12" r="2"/>',
                '<rect x="1" y="6" width="22" height="12" rx="2"/><circle cx="7" cy="12" r="2.5"/><circle cx="17" cy="12" r="2.5"/><path d="M1 14h22"/>'
            ];
            const iconSvg = icons[index % icons.length];
            
            const div = document.createElement('div');
            div.className = 'detail-card animate-fade-up';
            div.style.setProperty('--delay', `${index * 0.1}s`);
            div.innerHTML = `
                <div class="detail-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">${iconSvg}</svg></div>
                <div class="detail-value">${d.value || ''}</div>
                <div class="detail-unit">${d.unit || '&nbsp;'}</div>
                <div class="detail-label">${d.label || ''}</div>
            `;
            detailsGrid.appendChild(div);
        });
    }

    // 3. Highlights Grid
    const highlightsGrid = document.getElementById('dyn-highlights-grid');
    if (highlightsGrid && data.highlights) {
        highlightsGrid.innerHTML = '';
        data.highlights.forEach((h, index) => {
            const icons = [
                '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
                '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>',
                '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/>',
                '<path d="M12 22s-8-4.5-8-11.8A8 8 0 0120 10.2c0 7.3-8 11.8-8 11.8z"/><path d="M12 2L9 9h6L12 2z"/>'
            ];
            const iconSvg = icons[index % icons.length];
            
            const div = document.createElement('div');
            div.className = `highlight-card animate-fade-up ${h.isPrimary ? 'primary' : ''}`;
            div.style.setProperty('--delay', `${index * 0.1}s`);
            div.innerHTML = `
                <div class="highlight-icon-wrapper"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">${iconSvg}</svg></div>
                <h3>${h.title || ''}</h3>
                <p>${h.description || ''}</p>
                <div class="highlight-tag"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"/></svg> ${h.tag || ''}</div>
            `;
            highlightsGrid.appendChild(div);
        });
    }

    // 4. Nearby Categories
    const nearbyGrid = document.getElementById('dyn-nearby-categories');
    if (nearbyGrid && data.nearbyCategories) {
        nearbyGrid.innerHTML = '';
        data.nearbyCategories.forEach((cat, index) => {
            const iconMapping = {
                transport: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>',
                shopping: '<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>',
                school: '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5"/>',
                hospital: '<path d="M18 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2z"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>'
            };
            const iconSvg = iconMapping[cat.iconType] || iconMapping.transport;
            
            let itemsHtml = '';
            (cat.items || []).forEach(item => {
                itemsHtml += `
                    <div class="nearby-item">
                        <div class="item-dot"></div>
                        <div class="item-content">
                            <span class="item-name">${item.name || ''}</span>
                            <span class="item-type">${item.type || ''}</span>
                        </div>
                    </div>
                `;
            });

            const div = document.createElement('div');
            div.className = 'nearby-category animate-fade-up';
            div.style.setProperty('--delay', `${index * 0.1}s`);
            div.innerHTML = `
                <div class="category-header">
                    <div class="category-icon ${cat.iconType}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">${iconSvg}</svg></div>
                    <h3>${cat.title}</h3>
                </div>
                <div class="category-items">${itemsHtml}</div>
            `;
            nearbyGrid.appendChild(div);
        });
    }

    // 5. Gallery Images loaded from DB
    if (data.galleryImages && data.galleryImages.length >= 0) {
        galleryGrid.innerHTML = ''; // Clear default
        data.galleryImages.forEach(imgData => {
            addGalleryItem(imgData, false);
        });
    }

    // Re-bind click handlers for default gallery item since we reset html above
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.removeEventListener('click', itemClickHandler);
        item.addEventListener('click', itemClickHandler);
    });

    // Trigger scroll animations for new dynamic elements
    initScrollAnimations();
}

function itemClickHandler() {
    openLightbox(this);
}

// Fetch right away
fetchSiteContent();

// =========================================
// Navigation Scroll Effect
// =========================================
const navbar = document.getElementById('main-nav');

function handleNavScroll() {
    if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}
window.addEventListener('scroll', handleNavScroll, { passive: true });

// =========================================
// Mobile Menu Toggle
// =========================================
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuBtn.addEventListener('click', () => {
    mobileMenuBtn.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
});

mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// =========================================
// Scroll-Triggered Animations
// =========================================
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-fade-up:not(.visible)');
    const observerOptions = { threshold: 0.15, rootMargin: '0px 0px -40px 0px' };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => observer.observe(el));
}
initScrollAnimations();

// =========================================
// Smooth Scroll & Highlights
// =========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetPosition = target.getBoundingClientRect().top + window.pageYOffset - 80;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
    });
});

const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-links a:not(.nav-cta)');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        if (window.scrollY >= section.offsetTop - 120) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
    });
}, { passive: true });

// =========================================
// Visitor Counter (API-based)
// =========================================
async function initVisitorCounter() {
    const SESSION_KEY = 'commercial_building_session';
    const countEl = document.getElementById('visitor-count');
    
    try {
        let res;
        // Only increment if this is a new session
        if (!sessionStorage.getItem(SESSION_KEY)) {
            res = await fetch(`${API_URL}/visitor`, { method: 'POST' });
            sessionStorage.setItem(SESSION_KEY, 'true');
        } else {
            res = await fetch(`${API_URL}/visitor`);
        }
        
        if (res.ok) {
            const data = await res.json();
            if (countEl) animateCounter(countEl, data.visitorCount);
        }
    } catch (err) {
        console.error('Visitor API Error', err);
    }
}
initVisitorCounter();

function animateCounter(element, target, suffix = '') {
    const duration = 1500;
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = start + (target - start) * easeOut;

        element.textContent = Math.round(current) + suffix;

        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

// =========================================
// Photo Gallery — Upload & Display (API-based)
// =========================================
const galleryGrid = document.getElementById('gallery-grid');

function addGalleryItem(dataUrl, animated = true) {
    const url = typeof dataUrl === 'object' && dataUrl !== null ? (dataUrl.url || dataUrl.image || dataUrl.src || '') : dataUrl;
    if (!url) return;
    
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.setAttribute('data-src', url);
    
    if (animated) item.classList.add('animate-fade-up');
    else item.classList.add('visible');

    item.innerHTML = `
        <img src="${url}" alt="รูปภาพอาคารพาณิชย์" loading="lazy">
        <div class="gallery-item-overlay">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
            <span>ดูภาพขยาย</span>
        </div>
    `;

    item.addEventListener('click', itemClickHandler);
    galleryGrid.appendChild(item);

    if (animated) {
        requestAnimationFrame(() => item.classList.add('visible'));
    }
}

// Ensure first child event listener
const firstGalleryChild = galleryGrid.firstElementChild;
if (firstGalleryChild) {
    firstGalleryChild.addEventListener('click', itemClickHandler);
}
// =========================================
// Lightbox (API-based sync)
// =========================================
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev = document.getElementById('lightbox-prev');
const lightboxNext = document.getElementById('lightbox-next');
const lightboxCurrent = document.getElementById('lightbox-current');
const lightboxTotal = document.getElementById('lightbox-total');
const lightboxDelete = document.getElementById('lightbox-delete');
const lightboxOverlay = lightbox.querySelector('.lightbox-overlay');

let currentLightboxIndex = 0;

function getAllGalleryItems() { return Array.from(galleryGrid.querySelectorAll('.gallery-item')); }

function openLightbox(item) {
    const items = getAllGalleryItems();
    currentLightboxIndex = items.indexOf(item);
    updateLightboxImage();
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
}

function updateLightboxImage() {
    const items = getAllGalleryItems();
    if (items.length === 0) return closeLightbox();

    currentLightboxIndex = Math.max(0, Math.min(currentLightboxIndex, items.length - 1));
    const src = items[currentLightboxIndex].getAttribute('data-src');
    
    lightboxImg.src = src;
    lightboxCurrent.textContent = currentLightboxIndex + 1;
    lightboxTotal.textContent = items.length;

    const isDefaultImage = items[currentLightboxIndex].querySelector('img').src.includes('hero-building.png');
    
    // Only show delete button if user is Admin and it's not default image
    const token = localStorage.getItem('admin_token');
    lightboxDelete.style.display = (!isDefaultImage && token) ? 'flex' : 'none';

    lightboxPrev.style.display = items.length <= 1 ? 'none' : 'flex';
    lightboxNext.style.display = items.length <= 1 ? 'none' : 'flex';
}

function navigateLightbox(dir) {
    const items = getAllGalleryItems();
    currentLightboxIndex = (currentLightboxIndex + dir + items.length) % items.length;
    updateLightboxImage();
}

lightboxClose.addEventListener('click', closeLightbox);
lightboxOverlay.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
lightboxNext.addEventListener('click', () => navigateLightbox(1));

document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    switch (e.key) {
        case 'Escape': closeLightbox(); break;
        case 'ArrowLeft': navigateLightbox(-1); break;
        case 'ArrowRight': navigateLightbox(1); break;
    }
});

lightboxDelete.addEventListener('click', async () => {
    const items = getAllGalleryItems();
    const item = items[currentLightboxIndex];
    if (item.querySelector('img').src.includes('hero-building.png')) return;

    if (confirm('ต้องการลบรูปภาพนี้หรือไม่?')) {
        const token = localStorage.getItem('admin_token');
        if (!token) return alert('Unauthorized');

        // Gallery index in DB is index - 1 (since index 0 is hero)
        const dbIndex = currentLightboxIndex - 1;
        
        try {
            const res = await fetch(`${API_URL}/gallery/${dbIndex}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                item.remove();
                const newItems = getAllGalleryItems();
                if (newItems.length === 0) closeLightbox();
                else {
                    currentLightboxIndex = Math.min(currentLightboxIndex, newItems.length - 1);
                    updateLightboxImage();
                }
            } else {
                alert('ไม่สามารถลบได้');
            }
        } catch(e) {
            console.error('Delete error', e);
        }
    }
});

// Parallax Effect
const heroImgVar = document.querySelector('.hero-img');
window.addEventListener('scroll', () => {
    if (window.innerWidth > 768 && heroImgVar) {
        heroImgVar.style.transform = `scale(1.05) translateY(${window.scrollY * 0.3}px)`;
    }
}, { passive: true });
