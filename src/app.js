const swaggerUi = require('swagger-ui-express')
const specs = require('./swagger')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const routes = require('./routes')

const app = express()
app.use(cors({ origin: '*', methods: '*' }))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/', routes.homeRouter)
app.use('/user', routes.userRouter)
app.use('/login', routes.loginRouter)
app.use('/category', routes.categoryRouter)
app.use('/bank', routes.bankRouter)
app.use('/fature', routes.fatureRouter)
app.use('/transaction', routes.transactionRouter)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))

// const controller = require('./controllers')
// async function teste() {
// 	console.log('iniciou')
// 	global.userId = '5eb35366f28f716b9f5dc078'
// 	const xxx = await controller.transactionController.bankTransference({
// 		originBankId: '5f5cbbf62526660ea35bf83e',
// 		finalBankId: '5ece4e0d943173001774cb1c',
// 		categoryId: '5ed678b44ccebd0017598daf',
// 		value: '1',
// 	})
// 	console.log('xxx>', xxx)
// }
// teste()

module.exports = app
