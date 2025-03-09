const express = require('express');
const axios = require('axios');

const path = require('path')
const getColors = require('get-image-colors');
const { file } = require('bun');

const app = express();
const port = 4546;

app.use(express.json());

app.post('/get-colors', async (req, res) => {
    const { imageUrl } = req.body;
    console.log(imageUrl, req.body);
    if (!imageUrl) {
        return res.status(400).send('imageUrl is required');
    }

    try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data, 'binary');
        
        getColors(imageBuffer, 'image/png').then(colors => {
            const filteredColors = colors.filter(color => {
                const [r, g, b] = color.rgb();
                // Calculate brightness using the formula: (0.299*R + 0.587*G + 0.114*B)
                const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
                return brightness > 40; // Adjust the threshold as needed
            });
            if(filteredColors.length >= 1) {
                return res.send(filteredColors.map(color => color.rgb()));
            }
            res.send(colors.map(color => color.rgb()));
        })
    } catch (error) {
        res.status(500).send('Error processing image');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});