const transaction = require('./transactionModel')
const description = require('./descriptionsModel')
const bank = require('./bankModel')
const user = require('./userModel')

module.exports = {
	transaction,
	description,
	bank,
	user,
}
