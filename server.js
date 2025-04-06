const express = require('express');
const axios = require('axios');

const path = require('path')
const getColors = require('get-image-colors');

require('dotenv').config();

const app = express();
const port = 4546;



app.use(express.json());

app.post('/get-colors', async (req, res) => {
    const { imageUrl } = req.body;
    const authHeader = req.headers['authorization'];
    if (!authHeader || authHeader !== 'Bearer ' + process.env.TOKEN) {
        return res.status(403).send('Forbidden');
    }
    if (!imageUrl) {
        return res.status(400).send('imageUrl is required');
    }

    try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data, 'binary');
        
        getColors(imageBuffer, 'image/png').then(colors => {
            const filteredColors = colors.filter(color => {
                const [r, g, b] = color.rgb();
                const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
                return brightness > 40;
            });
            if(filteredColors.length >= 1) {
                return res.send(filteredColors.map(color => color.rgb()));
            }
            res.send(colors.map(color => color.rgb()));
        })
    } catch (error) {
        console.error('Error fetching image:', error);
        res.status(500).send(JSON.stringify(error));
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});