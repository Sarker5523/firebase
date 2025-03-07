const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

// Serve the static files (your HTML file)
app.use(express.static(path.join(__dirname, 'public')));

// Function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Serve the main page with the video player
app.get('/', (req, res) => {
    // Read the video data from a JSON file
    fs.readFile(path.join(__dirname, 'public', 'videoData.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading video data:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        // Parse the video data and generate suggestions
        const videoData = JSON.parse(data);
        videoData.forEach(video => {
            // Generate suggestions excluding the current video
            const suggestions = videoData
                .filter(v => v.id !== video.id)
                .map(v => v.id);
            shuffleArray(suggestions);
            video.suggestions = suggestions;
        });

        // Render the HTML with the video data and suggestions
        const html = generateHTML(videoData);
        res.send(html);
    });
});

// Function to generate the HTML with video data
function generateHTML(videoData) {
    let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Video Suggestions</title>
    </head>
    <body>
        <div id="videos">`;

    videoData.forEach(video => {
        html += `
        <div>
            <h2>${video.name}</h2>
            <img src="${video.thumbnail}" alt="${video.name}" />
            <p>${video.description}</p>
            <a href="${video.url}">Watch Video</a>
            <h3>Suggestions:</h3>
            <ul>`;
        
        video.suggestions.forEach(suggestionId => {
            const suggestion = videoData.find(v => v.id === suggestionId);
            html += `<li>${suggestion.name}</li>`;
        });

        html += `</ul>
        </div>`;
    });

    html += `
        </div>
    </body>
    </html>
    `;
    return html;
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
