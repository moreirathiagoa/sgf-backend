const mongoose = require('mongoose')
const Schema = mongoose.Schema

const category = new Schema({
	userId: { type: String, required: true },
	name: { type: String, required: true },
	createDate: { type: String, required: true },
	isActive: { type: Boolean, required: true, default: true },
})

const categoryModel = mongoose.model('Category', category)

module.exports = categoryModel
