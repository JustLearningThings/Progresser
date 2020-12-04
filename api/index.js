const express = require('express')
const app = express()
const mongoose = require('mongoose')

require('dotenv').config()
const PORT = 3000 || process.env.PORT

const methodOverride = require('method-override')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const auth = require('./auth.js')

mongoose.connect('mongodb://localhost:27017/progresser', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })

app.use(methodOverride('X-HTTP-Method-Override'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser())

app.use('/auth', auth.router)
app.use('/api', require('./routes.js'))

app.listen(PORT, () => console.log(`App running on port: ${PORT}`))