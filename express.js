require('dotenv').config()

const express = require('express')
const connectDB = require('./db')
const routeStudent = require('./routes/routeStudent')

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use('/api/feedback', routeStudent)

app.get('/', (req, res) => {
    res.send('Express server is running')
})

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`)
        })
    })
    .catch((e) => {
       console.log(e);
    })

module.exports = app
