const bank = require('./bankController')
const fature = require('./fatureController')
const transaction = require('./transactionController')
const description = require('./descriptionController')
const login = require('./loginController')
const user = require('./userController')

module.exports = {
	bank,
	transaction,
	description,
	login,
	user,
	fature,
}
