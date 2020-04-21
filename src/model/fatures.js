const mongoose = require('mongoose')
const Schema = mongoose.Schema
const utils = require('../utils')

const fature = new Schema({

    name: { type: String, required: true },
    createDate: { type: String, required: true, default: utils.getMomentNow() },
    dueDate: { type: String, required: true },
    isPayed: { type: Boolean, required: true, default: false },
    bank_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'bank',
        required: true
    },
    fatureBalance: { type: Number, required: true }
})

const fatureModel = mongoose.model('fature', fature)

module.exports = fatureModel