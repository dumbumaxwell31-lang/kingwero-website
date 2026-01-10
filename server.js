
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

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
    destination: uploadDir,
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Upload advert
app.post('/upload-ad', upload.single('image'), (req, res) => {
    const { title, link } = req.body;
    if (!req.file) return res.status(400).json({ success: false });

    const adsFile = path.join(__dirname, 'ads.json');
    const image = `/uploads/${req.file.filename}`;

    let ads = fs.existsSync(adsFile)
        ? JSON.parse(fs.readFileSync(adsFile))
        : [];

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
        ? JSON.parse(fs.readFileSync(adsFile))
        : [];

    res.json(ads);
});

// Delete advert
app.delete('/delete-ad/:id', (req, res) => {
    const adsFile = path.join(__dirname, 'ads.json');
    if (!fs.existsSync(adsFile)) {
        return res.json({ success: false });
    }

    let ads = JSON.parse(fs.readFileSync(adsFile));
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
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
