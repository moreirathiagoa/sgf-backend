const mongoose = require('mongoose')
const Schema = mongoose.Schema
const utils = require('../utils')

const bank = new Schema({

    name: { type: String, required: true },
    isActive: { type: Boolean, required: true, default: true },
    createDate: { type: String, required: true, default: utils.getMomentNow() },
    bankType: {
        type: String,
        enum : ['Conta Corrente', 'Conta Cartão', 'Cartão de Crédito', 'Poupança'],
        required: true
    },
    systemBalance: { type: Number, required: true, default: 0 },
    manualBalance: { type: Number, required: true, default: 0 },
})

const bankModel = mongoose.model('bank', bank)

module.exports = bankModel