
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();

// ✅ IMPORTANT: Render provides PORT automatically
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Upload advert
app.post('/upload-ad', upload.single('image'), (req, res) => {
    const { title, link } = req.body;
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const adsFile = path.join(__dirname, 'ads.json');
    const image = `/uploads/${req.file.filename}`;

    let ads = [];
    if (fs.existsSync(adsFile)) {
        ads = JSON.parse(fs.readFileSync(adsFile, 'utf-8'));
    }

    ads.push({
        id: Date.now(),
        title,
        link,
        image
    });

    fs.writeFileSync(adsFile, JSON.stringify(ads, null, 2));
    res.json({ success: true });
});

// Get adverts
app.get('/api/ads', (req, res) => {
    const adsFile = path.join(__dirname, 'ads.json');
    const ads = fs.existsSync(adsFile)
        ? JSON.parse(fs.readFileSync(adsFile, 'utf-8'))
        : [];

    res.json(ads);
});

// Delete advert
app.delete('/delete-ad/:id', (req, res) => {
    const adsFile = path.join(__dirname, 'ads.json');
    if (!fs.existsSync(adsFile)) {
        return res.json({ success: false });
    }

    let ads = JSON.parse(fs.readFileSync(adsFile, 'utf-8'));
    const ad = ads.find(a => a.id == req.params.id);

    if (ad && ad.image) {
        const imgPath = path.join(__dirname, ad.image);
        if (fs.existsSync(imgPath)) {
            fs.unlinkSync(imgPath);
        }
    }

    ads = ads.filter(a => a.id != req.params.id);
    fs.writeFileSync(adsFile, JSON.stringify(ads, null, 2));

    res.json({ success: true });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
});
