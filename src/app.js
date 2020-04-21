const swaggerUi = require('swagger-ui-express')
const specs = require('./swagger')
const express = require('express')
const bodyParser = require('body-parser')
const routes = require('./routes')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/', routes.homeRouter)
app.use('/category', routes.categoryRouter)
app.use('/bank', routes.bankRouter)
app.use('/transaction', routes.transactionRouter)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))

module.exports = app
