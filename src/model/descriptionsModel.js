const mongoose = require('mongoose')
const Schema = mongoose.Schema

const description = new Schema({
	userId: { type: String, required: true },
	name: { type: String, required: true },
	createDate: { type: String, required: true },
	lastUpdate: { type: String, required: true },
	count: { type: Number, required: true },
	isActive: { type: Boolean, required: true, default: true },
})

const descriptionModel = mongoose.model('Description', description)

module.exports = descriptionModel
