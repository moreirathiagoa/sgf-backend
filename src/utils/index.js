const _ = require('lodash')
const moment = require('moment')
const momentTz = require('moment-timezone')

function getMomentNow(){
    return momentTz.tz(moment(), 'America/Sao_Paulo').format()
}

function getDateInformed(informedData){
    return momentTz.tz(informedData, 'America/Sao_Paulo').format()
}

function prepareToCsv(texto){
    return '"' + texto.toString().replace(/\"/g, '""') + '"'
}

module.exports = {
    prepareToCsv,
    getMomentNow,
    getDateInformed
}