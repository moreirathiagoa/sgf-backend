const mongoose = require('mongoose')
const Schema = mongoose.Schema
const utils = require('../utils')

const transaction = new Schema({

    userId: { type: String, required: true },
    isCompesed: { type: Boolean, required: true, default: true },
    createDate: { type: String, required: true, default: utils.getMomentNow() },
    efectedDate: { type: String, required: true, default: utils.getMomentNow() },
    description: { type: String },
    value: { type: Number, required: true },
    currentRecurrence: { type: Number },
    finalRecurrence: { type: Number },
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