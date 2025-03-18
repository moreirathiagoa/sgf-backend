const mongoose = require('mongoose')
const Schema = mongoose.Schema

const transaction = new Schema({
	userId: { type: String, required: true },
	value: { type: Number, required: true },
	createDate: { type: String, required: true },
	efectedDate: { type: String, required: true },
	isCompesed: { type: Boolean, required: true },
	currentRecurrence: { type: Number },
	finalRecurrence: { type: Number },
	description: { type: String },
	detail: { type: String },
	bankName: { type: String },
	typeTransaction: {
		type: String,
		enum: ['contaCorrente', 'cartaoCredito', 'planejamento'],
		required: true,
	},
	bank_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Bank',
		required: true,
	},
	category_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Category',
		required: false,
	},
	fature_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Fature',
	},
})

const transactionModel = mongoose.model('Transaction', transaction)

module.exports = transactionModel
