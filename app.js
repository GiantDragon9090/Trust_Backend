const express = require('express')
const cors = require('cors')
const path = require("path")
const route = require('./route')
const { port } = require('./config/settings')
const fileUpload = require('express-fileupload')
const dotenv = require('dotenv')

dotenv.config()
const app = express()

const whitelist = process.env.WHITELIST

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin.replace(/\/$/, "")) !== -1) {
      callback(null, true)
    } else {
      callback(new Error(`${origin} Not allowed by CORS`))
    }
  },
}

app.use(express.static(path.join(__dirname, "build")))
app.use(cors(corsOptions))
app.use(express.json())
app.options('*', cors())
app.use(express.urlencoded({ extended: true }))
app.use(fileUpload({
  createParentPath: true
}))

app.use('/', route)

app.listen(port, async () => {
  console.log("server started using port ", port)
})

