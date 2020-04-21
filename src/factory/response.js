const moment = require('moment')
const momentTz = require('moment-timezone')

/**
 * Retorna um objeto de resposta padrão para as requisições
 * @param {Number} statusCode Código do erro
 * @param {String} statusText String de erro com uma mensagem generica
 * @param {Object} data Parâmetro personalizado com o erro
 * @returns Retorna um Object padrão de resposta
 * @author {Thiago Moreira}
 */
function responseFactory(statusCode, statusText, data) {
    return {
        date: momentTz.tz(moment(), 'America/Sao_Paulo').format(),
        status: statusCode,
        statusText: statusText,
        data: data
    }
}

module.exports = {
    responseFactory
}
