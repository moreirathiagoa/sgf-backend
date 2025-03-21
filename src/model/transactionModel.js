const mongoose = require('mongoose')
const { Schema } = mongoose

const transactionSchema = new Schema({
	userId: { type: String, required: true },
	value: { type: Number, required: true },
	createdAt: { type: Date, required: true },
	effectedAt: { type: Date, required: true },
	isCompensated: { type: Boolean, required: true },
	currentRecurrence: { type: Number },
	finalRecurrence: { type: Number },
	description: { type: String },
	detail: { type: String },
	bankName: { type: String },
	transactionType: {
		type: String,
		enum: ['contaCorrente', 'cartaoCredito', 'planejamento'],
		required: true,
	},
	bankId: {
		type: Schema.Types.ObjectId,
		ref: 'Bank',
		required: true,
	},
})

const Transaction = mongoose.model('Transaction', transactionSchema)

module.exports = Transaction
