const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

app.use(express.static(path.join(__dirname, 'public')));

// API to fetch videos dynamically
app.get('/api/videos', (req, res) => {
    fs.readFile(path.join(__dirname, 'public', 'videoData.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading video data:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        const videoData = JSON.parse(data);
        res.json(videoData);
    });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
