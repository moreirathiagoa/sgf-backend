const mongoose = require('mongoose')
const Schema = mongoose.Schema
const utils = require('../utils')
const properties = require('../properties')

const category = new Schema({

    userId: { type: String, required: true },
    name: { type: String, required: true },
    createDate: { type: String, required: true },
    isActive: { type: Boolean, required: true, default: true },

})

const categoryModel = mongoose.model(properties.prefixo+'Category', category)

module.exports = categoryModel