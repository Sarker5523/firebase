const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Function to get all item ids
function getAllItemIds(data) {
    return data.map(item => item.id);
}

// Serve the static files (your HTML file)
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main page with the video player
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Route to get the data with randomized suggestions
app.get('/data', (req, res) => {
    // Read the JSON file
    const data = JSON.parse(fs.readFileSync('data.json', 'utf-8'));

    // Get all item ids
    const allItemIds = getAllItemIds(data);

    // Add randomized suggestions to each item
    const dataWithSuggestions = data.map(item => {
        const suggestions = shuffleArray(allItemIds.filter(id => id !== item.id));
        return { ...item, suggestions };
    });

    res.json(dataWithSuggestions);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
