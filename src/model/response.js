const mongoose = require('mongoose')
const Schema = mongoose.Schema

const responseSchema = new Schema({
    date: String,
    status: Number,
    statusText: String,
    data: Object
})

const Response = mongoose.model('Response', responseSchema)

module.exports = Response