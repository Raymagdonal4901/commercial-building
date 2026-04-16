const mongoose = require('mongoose');

const NearbyItemSchema = new mongoose.Schema({
    name: String,
    type: String
}, { _id: false });

const NearbyCategorySchema = new mongoose.Schema({
    title: String,
    iconType: String, // 'transport', 'shopping', 'school', 'hospital'
    items: [NearbyItemSchema]
}, { _id: false });

const HighlightSchema = new mongoose.Schema({
    title: String,
    description: String,
    tag: String,
    isPrimary: { type: Boolean, default: false }
}, { _id: false });

const DetailSchema = new mongoose.Schema({
    value: String,
    unit: String,
    label: String
}, { _id: false });

const SiteContentSchema = new mongoose.Schema({
    // Hero Section
    heroTitle: { type: String, default: 'ขายอาคารพาณิชย์ 4 ชั้น' },
    heroTitleGold: { type: String, default: 'ทำเลทอง' },
    heroTitleSuffix: { type: String, default: 'ลำลูกกาคลอง 3-4' },
    heroBadge: { type: String, default: 'ประกาศขาย' },
    heroSubtitle: { type: String, default: 'เหมาะสำหรับเป็นทั้งบ้านและโฮมออฟฟิศ' },

    // Price
    priceLabel: { type: String, default: 'ราคาพิเศษ' },
    priceValue: { type: String, default: '฿3,990,000' },
    priceTag: { type: String, default: 'โอนฟรี!' },

    // Price Strip
    stripPrice: { type: String, default: '฿3,990,000' },
    stripTransfer: { type: String, default: 'ไม่มีค่าใช้จ่ายเพิ่ม' },
    stripUsage: { type: String, default: 'บ้าน & โฮมออฟฟิศ' },

    // Property Details
    details: [DetailSchema],

    // Highlights
    highlights: [HighlightSchema],

    // Nearby Landmarks
    nearbyCategories: [NearbyCategorySchema],

    // Contact
    contactTitle: { type: String, default: 'สนใจอาคารพาณิชย์นี้?' },
    contactSubtitle: { type: String, default: 'นัดชมโครงการวันนี้ หรือขอข้อมูลเพิ่มเติมได้ทันที' },
    phoneNumber: { type: String, default: '' },
    lineId: { type: String, default: '' },

    // Gallery images (URLs)
    galleryImages: [String],

    // Visitor count
    visitorCount: { type: Number, default: 0 },

    // Footer
    footerText: { type: String, default: 'ข้อมูลบนเว็บไซต์นี้จัดทำขึ้นเพื่อการโฆษณาเท่านั้น ข้อมูลอาจมีการเปลี่ยนแปลงได้โดยไม่ต้องแจ้งให้ทราบล่วงหน้า' }
}, { timestamps: true });

module.exports = mongoose.model('SiteContent', SiteContentSchema);
