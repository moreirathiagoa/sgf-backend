const mongoose = require('mongoose')
const Schema = mongoose.Schema
const utils = require('../utils')
const properties = require('../properties')

const fature = new Schema({

    userId: { type: String, required: true },
    name: { type: String, required: true },
    createDate: { type: String, required: true },
    isPayed: { type: Boolean, required: true, default: false },
    fatureBalance: { type: Number, required: true, default: 0 },
    bank_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: properties.prefixo + 'Bank',
        required: true
    }
})

const fatureModel = mongoose.model(properties.prefixo + 'Fature', fature)

module.exports = fatureModel