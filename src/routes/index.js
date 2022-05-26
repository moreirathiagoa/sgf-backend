const home = require('./homeRouter')
const category = require('./categoryRouter')
const bank = require('./bankRouter')
const fature = require('./fatureRouter')
const transaction = require('./transactionRouter')
const login = require('./loginRouter')
const user = require('./userRouter')
const balancesDashboard = require('./balancesDashboardRouter')
const extractPage = require('./extractPageRouter')

module.exports = {
	home,
	category,
	bank,
	transaction,
	login,
	user,
	fature,
	balancesDashboard,
	extractPage,
}
