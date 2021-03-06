require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

app.get('/apod', async (req, res) => {
    try {
        let image = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`)
            .then(res => res.json());
        res.send({ image });
    } catch (err) {
        console.log('error:', err);
    }
})

app.get('/roverManifest/:rover_name', async (req, res) => {
    const roverName = req.params.rover_name.toLowerCase();

    try {
        let data = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${roverName}?api_key=${process.env.API_KEY}`)
            .then(res => res.json());
        res.send({ data });
    } catch (err) {
        console.log('error:', err);
    }
})

app.get('/roverImages/:rover_name/:sol', async (req, res) => {
    const roverName = req.params.rover_name.toLowerCase();
    const sol = req.params.sol;

    try {
        let data = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${roverName}/photos?sol=${sol}&api_key=${process.env.API_KEY}`)
            .then(res => res.json());
        res.send({ data });
    } catch (err) {
        console.log('error:', err);
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))