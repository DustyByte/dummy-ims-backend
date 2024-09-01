const express = require('express')

const app = express()

const port = process.env.port || 3000

app.use(express.json())

app.get('/', async (req, res) => {
    res.json({data: `stupidData`})
    res.end()
})

app.listen(port, () => {
    console.log(`Listening to ${port}`)
})
