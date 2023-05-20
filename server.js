require('dotenv').config()
const fs = require('fs');
const path = require('path');

const dotenvPath = path.resolve(__dirname, '.env');
const dotenv = fs.readFileSync(dotenvPath);
const envVariables = dotenv.toString().split('\n');

envVariables.forEach((envVariable) => {
  const [key, value] = envVariable.split('=');
  process.env[key] = value;
});

const express = require('express')
const app = express()
const ejs = require('ejs')

const expressLayout = require('express-ejs-layouts')
const PORT = process.env.PORT || 4000
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('express-flash')
const MongoDbStore = require('connect-mongo')(session)
const passport = require('passport')
const Emitter = require('events')

// Database connection
mongoose.connect(process.env.MONGO_CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Database connected...')
  })
  .catch((err) => {
    console.log('Connection failed:', err)
  })

// Session store
const connection = mongoose.connection;
const mongoStore = new MongoDbStore({
  mongooseConnection: connection,
  collection: 'sessions'
})



// Event emitter
const eventEmitter = new Emitter()
app.set('eventEmitter', eventEmitter)

// Session config
app.use(session({
  name: 'session-id',
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: false,
  store: mongoStore,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}))

// Passport config
const passportInit = require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())



app.use(flash())
// Assets
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Global middleware
app.use((req, res, next) => {
  res.locals.session = req.session
  res.locals.user = req.user
  next()
})
// Set template engine
app.use(expressLayout)
app.set('views', path.join(__dirname, '/resources/views'))
app.set('view engine', 'ejs')

require('./routes/web')(app)
app.use((req, res) => {
  res.status(404).render('errors/404')
})

const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})

