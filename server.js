const express = require('express');
const axios = require('axios');

const path = require('path')
const getColors = require('get-image-colors')

const app = express();
const port = 3002;

app.use(express.json());

app.post('/get-colors', async (req, res) => {
    const { imageUrl } = req.body;

    if (!imageUrl) {
        return res.status(400).send('imageUrl is required');
    }

    try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data, 'binary');
        
        getColors(buffer, 'image/gif').then(colors => {
            res.send(colors.map(color => color.rgb()));
        })
    } catch (error) {
        res.status(500).send('Error processing image');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});