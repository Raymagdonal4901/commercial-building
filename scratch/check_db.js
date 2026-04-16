const mongoose = require('mongoose');
require('dotenv').config();
const SiteContent = require('../models/SiteContent');

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        const content = await SiteContent.findOne();
        if (content) {
            console.log('📄 Document found');
            console.log('🔑 Keys in document:', Object.keys(content.toObject()));
            const images = content.galleryImages || [];
            console.log('🖼️ Gallery Images count:', images.length);
            const size = JSON.stringify(content).length;
            console.log('⚖️ Document size:', (size / 1024 / 1024).toFixed(2), 'MB');
            if (size > 14 * 1024 * 1024) {
                console.log('⚠️ DOCUMENT IS NEAR 16MB LIMIT!');
            }
        } else {
            console.log('❌ No document found');
        }
    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        mongoose.disconnect();
    }
}

check();
