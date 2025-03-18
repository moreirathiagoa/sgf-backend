const home = require('./homeRouter')
const bank = require('./bankRouter')
const transaction = require('./transactionRouter')
const login = require('./loginRouter')
const user = require('./userRouter')
const balancesDashboard = require('./balancesDashboardRouter')
const extractPage = require('./extractPageRouter')
const newTransaction = require('./newTransactionRouter')
const planning = require('./planningRouter')

module.exports = {
	home,
	bank,
	transaction,
	login,
	user,
	balancesDashboard,
	extractPage,
	newTransaction,
	planning,
}
