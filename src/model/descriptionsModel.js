const mongoose = require('mongoose')
const Schema = mongoose.Schema

const description = new Schema({
	userId: { type: String, required: true },
	name: { type: String, required: true },
	createdAt: { type: Date, required: true },
	lastUpdate: { type: Date, required: true },
	count: { type: Number, required: true },
	isActive: { type: Boolean, required: true, default: true },
})

const descriptionModel = mongoose.model('Description', description)

module.exports = descriptionModel
