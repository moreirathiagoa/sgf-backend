const specs = require('./swagger')
const routes = require('./routes')

const swaggerUi = require('swagger-ui-express')
const express = require('express')
const cors = require('cors')

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
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))

module.exports = app
