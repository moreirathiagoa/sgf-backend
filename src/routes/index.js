const homeRouter = require('./homeRouter')
const categoryRouter = require('./categoryRouter')
const bankRouter = require('./bankRouter')
const fatureRouter = require('./fatureRouter')
const transactionRouter = require('./transactionRouter')
const loginRouter = require('./loginRouter')
const userRouter = require('./userRouter')
const balancesDashboard = require('./balancesDashboardRouter')

module.exports = {
	homeRouter,
	categoryRouter,
	bankRouter,
	transactionRouter,
	loginRouter,
	userRouter,
	fatureRouter,
	balancesDashboard,
}
