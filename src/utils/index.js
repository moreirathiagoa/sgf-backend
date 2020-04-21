const _ = require('lodash')


function prepareToCsv(texto){
    return '"' + texto.toString().replace(/\"/g, '""') + '"'
}

module.exports = {
    prepareToCsv
}