const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const serverless = require('serverless-http');

const app = express();


app.use(cors());
app.use(express.json());


const storage = multer.memoryStorage();
const upload = multer({ storage });


app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

  
    const demoUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    
    res.json({
        url: demoUrl,
        message: 'For production use, implement cloud storage upload'
    });
});


app.delete('/api/delete', (req, res) => {
   
    res.json({ message: 'Delete endpoint - implement cloud storage deletion' });
});


app.use(express.static(path.join(__dirname, 'public')));


app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;
module.exports.handler = serverless(app);
