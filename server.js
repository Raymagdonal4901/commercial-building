require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const SiteContent = require('./models/SiteContent');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// =========================================
// Serve HTML pages (Move above static for precedence)
// =========================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Serve static files (style.css, script.js, images)
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected to commercial_building'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// =========================================
// Helper: Get or Create Default Content
// =========================================
async function getContent() {
    let content = await SiteContent.findOne();
    if (!content) {
        content = await SiteContent.create({
            details: [
                { value: '20.7', unit: 'ตร.ว.', label: 'เนื้อที่' },
                { value: '4 ชั้น', unit: 'มีระเบียง', label: 'จำนวนชั้น' },
                { value: '4', unit: 'ห้อง', label: 'ห้องน้ำ' },
                { value: 'หน้า-หลัง', unit: '', label: 'ที่จอดรถ' }
            ],
            highlights: [
                { title: 'เดินทางสะดวก', description: 'เชื่อมต่อคลอง 2, 3, 4 ได้อย่างสะดวก ไม่ว่าจะเดินทางไปทิศไหนก็ง่าย ประหยัดเวลาในการเดินทาง', tag: 'ทำเลทอง', isPrimary: true },
                { title: 'ใกล้ตลาดลาดสวาย', description: 'อยู่ใกล้ตลาดลาดสวาย แหล่งรวมสินค้า อาหาร และของใช้ครบครัน สะดวกต่อการใช้ชีวิตประจำวัน', tag: 'ใกล้แหล่งชุมชน', isPrimary: false },
                { title: 'บ้าน & โฮมออฟฟิศ', description: 'ออกแบบมาเพื่อรองรับทั้งการอยู่อาศัยและการทำธุรกิจ ตอบโจทย์ทุกไลฟ์สไตล์', tag: 'อเนกประสงค์', isPrimary: false },
                { title: 'ราคาคุ้มค่า', description: 'ราคาเพียง 3.99 ล้านบาท พร้อมโอนฟรี ไม่มีค่าใช้จ่ายซ่อนเร้น คุ้มค่าที่สุดในย่านนี้', tag: 'โอนฟรี', isPrimary: false }
            ],
            nearbyCategories: [
                {
                    title: 'การเดินทาง', iconType: 'transport',
                    items: [
                        { name: 'รถไฟฟ้าสถานีคูคต', type: 'สายสีเขียว' },
                        { name: 'มอเตอร์เวย์', type: 'เข้า-ออกสะดวก' }
                    ]
                },
                {
                    title: 'ช้อปปิ้ง', iconType: 'shopping',
                    items: [
                        { name: 'ตลาดลาดสวาย', type: 'ตลาดสด' },
                        { name: 'ตลาดดีดี', type: 'ตลาดนัด' },
                        { name: 'บิ๊กซี ลำลูกกา', type: 'ไฮเปอร์มาร์เก็ต' },
                        { name: 'Makro', type: 'ค้าส่ง' },
                        { name: 'Future Park', type: 'ห้างสรรพสินค้า' }
                    ]
                },
                {
                    title: 'โรงเรียน', iconType: 'school',
                    items: [
                        { name: 'รร.บีคอนเฮ้าส์ แย้มสะอาด', type: 'โรงเรียนนานาชาติ' },
                        { name: 'รร.สวนกุหลาบ', type: 'โรงเรียนรัฐบาล' }
                    ]
                },
                {
                    title: 'โรงพยาบาล', iconType: 'hospital',
                    items: [
                        { name: 'รพ.สินแพทย์', type: 'โรงพยาบาลเอกชน' }
                    ]
                }
            ],
            galleryImages: []
        });
        console.log('📦 Default content created');
    }
    return content;
}

// =========================================
// AUTH Middleware
// =========================================
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

// =========================================
// PUBLIC API ROUTES
// =========================================

// Get all site content (public)
app.get('/api/content', async (req, res) => {
    try {
        const content = await getContent();
        res.json(content);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Increment visitor count (public)
app.post('/api/visitor', async (req, res) => {
    try {
        const content = await SiteContent.findOneAndUpdate(
            {},
            { $inc: { visitorCount: 1 } },
            { returnDocument: 'after' }
        );
        res.json({ visitorCount: content.visitorCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get visitor count (public)
app.get('/api/visitor', async (req, res) => {
    try {
        const content = await getContent();
        res.json({ visitorCount: content.visitorCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// =========================================
// ADMIN API ROUTES (Protected)
// =========================================

// Login check
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === process.env.ADMIN_PASSWORD) {
        res.json({ success: true, token: process.env.ADMIN_PASSWORD });
    } else {
        res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
    }
});

// Update site content (protected)
app.put('/api/content', requireAuth, async (req, res) => {
    try {
        console.log('📝 Received content update request');
        const content = await SiteContent.findOneAndUpdate(
            {},
            { $set: req.body },
            { returnDocument: 'after', upsert: true }
        );
        console.log('✅ Content updated successfully');
        res.json(content);
    } catch (error) {
        console.error('❌ Save error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Upload gallery image as base64 (protected)
app.post('/api/gallery', requireAuth, async (req, res) => {
    try {
        const { image } = req.body; // base64 data URL
        if (!image) return res.status(400).json({ error: 'No image provided' });

        const content = await SiteContent.findOneAndUpdate(
            {},
            { $push: { galleryImages: image } },
            { returnDocument: 'after' }
        );
        res.json({ galleryImages: content.galleryImages });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete gallery image (protected)
app.delete('/api/gallery/:index', requireAuth, async (req, res) => {
    try {
        const content = await getContent();
        const idx = parseInt(req.params.index);
        if (idx < 0 || idx >= content.galleryImages.length) {
            return res.status(400).json({ error: 'Invalid index' });
        }
        content.galleryImages.splice(idx, 1);
        await content.save();
        res.json({ galleryImages: content.galleryImages });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// HTML routes moved above static middleware

// =========================================
// Start Server
// =========================================
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`🔧 Admin Dashboard: http://localhost:${PORT}/admin`);
    });
}

module.exports = app;
