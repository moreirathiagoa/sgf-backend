const routes = require('./routes')
const express = require('express')
const cors = require('cors')
const database = require('./database')

database.start()

const app = express()
app.use(cors({ origin: '*', methods: '*' }))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/', routes.homeRouter)
app.use('/user', routes.userRouter)
app.use('/login', routes.loginRouter)
app.use('/category', routes.categoryRouter)
app.use('/bank', routes.bankRouter)
app.use('/fature', routes.fatureRouter)
app.use('/transaction', routes.transactionRouter)

module.exports = app
