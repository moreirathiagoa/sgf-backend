const category = require('./categoryController')
const bank = require('./bankController')
const fature = require('./fatureController')
const transaction = require('./transactionController')
const login = require('./loginController')
const user = require('./userController')

module.exports = {
	category,
	bank,
	transaction,
	login,
	user,
	fature,
}
