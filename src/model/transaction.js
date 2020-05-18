const mongoose = require('mongoose')
const Schema = mongoose.Schema
const utils = require('../utils')

const transaction = new Schema({

    _id: { type: Object },
    userId: { type: String, required: true },
    value: { type: Number, required: true },
    createDate: { type: String, required: true },
    efectedDate: { type: String, required: true },
    isCompesed: { type: Boolean, required: true, default: true },
    currentRecurrence: { type: Number },
    finalRecurrence: { type: Number },
    description: { type: String },
    typeTransaction: {
        type: String,
        enum: ['contaCorrente', 'cartaoCredito', 'planejamento'],
        required: true
    },
    bank_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bank',
        required: true
    },
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    fature_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fature'
    },

})

const transactionModel = mongoose.model('Transaction', transaction)

module.exports = transactionModel