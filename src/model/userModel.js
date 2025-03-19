const mongoose = require('mongoose')
const Schema = mongoose.Schema

const user = new Schema({
	userName: { type: String, required: true },
	userEmail: { type: String, required: true },
	userPassword: { type: String, required: true },
	createdAt: { type: Date, required: true },
	isActive: { type: Boolean, required: true, default: true },
	loginList: [{ type: Date }],
})

const userModel = mongoose.model('User', user)

module.exports = userModel
