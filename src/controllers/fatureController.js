const _ = require('lodash')
const utils = require('../utils')
const db = require('../database')
const model = require('../model')

async function getListFatures(idBank) {
    try {
        const params = { bank_id: idBank, userId: global.userId }
        const fatureFind = await db.find(model.faturesModel, params)
        if (_.isEmpty(fatureFind))
            return utils.makeResponse(203, 'Fatura não encontrada', [])

        return utils.makeResponse(200, 'Lista de Faturas', fatureFind)
    } catch (error) {
        console.log(error)
        throw {
            error: error
        }
    }
}

module.exports = {
    getListFatures,
}
