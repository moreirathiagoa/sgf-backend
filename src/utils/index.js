const _ = require('lodash')
const moment = require('moment')
const momentTz = require('moment-timezone')

function getMomentNow(){
    return momentTz.tz(moment(), 'America/Sao_Paulo').format()
}

function getDateInformed(informedData){
    return momentTz.tz(informedData, 'America/Sao_Paulo').format()
}

function validateRequiredsElements(object, requireds){
    let emptyAtributes = []
    requireds.forEach(element => {
        if (!object.hasOwnProperty(element)) {
            emptyAtributes.push(element) 
        }
    });
    return emptyAtributes.join(', ')
}

function makeResponse(code, message, data){
    return {
        code: code,
        message: message,
        data: data
    }
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

module.exports = {
    getMomentNow,
    getDateInformed,
    validateRequiredsElements,
    isNumeric,
    makeResponse
}