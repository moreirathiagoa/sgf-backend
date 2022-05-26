const routes = require('./routes')
const express = require('express')
const cors = require('cors')
require('./database').start()
global.logger = require('../config/logger')

const app = express()
app.use(cors({ origin: '*', methods: '*' }))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/', routes.home)
app.use('/user', routes.user)
app.use('/login', routes.login)
app.use('/category', routes.category)
app.use('/bank', routes.bank)
app.use('/fature', routes.fature)
app.use('/transaction', routes.transaction)
app.use('/balances-dashboard', routes.balancesDashboard)
app.use('/extract-page', routes.extractPage)

module.exports = app
