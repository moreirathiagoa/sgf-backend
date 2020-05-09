const mongoose = require('mongoose')
const Schema = mongoose.Schema
const utils = require('../utils')

const user = new Schema({

    userName: { type: String, required: true },
    userPassword: { type: String, required: true },
    createDate: { type: String, required: true, default: utils.getMomentNow() },
    isActive: { type: Boolean, required: true, default: true },
    loginList: [{ type: String }]

})

const userModel = mongoose.model('User', user)

module.exports = userModel
