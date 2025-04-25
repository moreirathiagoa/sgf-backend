const mongoose = require('mongoose')
const { Schema } = mongoose

const amountHistorySchema = new Schema({
	userId: { type: String, required: true },
	createdAt: { type: Date, required: true },
	forecastIncoming: { type: Number, required: true },
	forecastOutgoing: { type: Number, required: true },
	actualBalance: { type: Number, required: true },
	netBalance: { type: Number, required: true },
})

const AmountHistory = mongoose.model('AmountHistory', amountHistorySchema)

module.exports = AmountHistory
