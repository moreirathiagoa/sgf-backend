const mongoose = require('mongoose')
const { Schema } = mongoose

const bankSchema = new Schema({
	userId: { type: String, required: true },
	name: { type: String, required: true },
	isActive: { type: Boolean, required: true, default: true },
	createdAt: { type: Date, required: true },
	bankType: {
		type: String,
		enum: ['Conta Corrente', 'Conta Cartão', 'Cartão de Crédito', 'Poupança'],
		required: true,
	},
	systemBalance: { type: Number, required: true, default: 0 },
	manualBalance: { type: Number, required: true, default: 0 },
})

const Bank = mongoose.model('Bank', bankSchema)

module.exports = Bank
