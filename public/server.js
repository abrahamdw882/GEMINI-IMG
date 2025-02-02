const express = require('express');
const multer = require('multer');
const cors = require('cors');
const app = express();

app.use(cors());

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

app.post('/upload', upload.single('image'), (req, res) => {
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({
        url: imageUrl,
        deleteToken: req.file.filename
    });
});


app.delete('/upload', (req, res) => {
    const { token } = req.query;
    res.sendStatus(200);
});

app.use('/uploads', express.static('uploads'));

app.listen(3000, () => console.log('Server running on port 3000'));
