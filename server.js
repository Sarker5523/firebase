const express = require('express');
const app = express();
const path = require('path');

// Serve the static files (your HTML file)
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main page with the video player
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
