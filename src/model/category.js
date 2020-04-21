const mongoose = require('mongoose')
const Schema = mongoose.Schema
const utils = require('../utils')

const category = new Schema({

    name: { type: String, required: true },
    createDate: { type: String, required: true, default: utils.getMomentNow() },
    isActive: { type: Boolean, required: true, default: true },

})

const categoryModel = mongoose.model('category', category)

module.exports = categoryModel