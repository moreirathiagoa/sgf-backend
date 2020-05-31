const _ = require('lodash')
const utils = require('../utils')
const db = require('../database')
const model = require('../model')

async function getListFatures(idBank) {
    try {
        const params = { bank_id: idBank, userId: global.userId }
        const fatureFind = await db.find(model.faturesModel, params)
        if (_.isEmpty(fatureFind))
            return utils.makeResponse(203, 'Faturas não encontradas', [])

        return utils.makeResponse(200, 'Lista de Faturas', fatureFind)
    } catch (error) {
        console.log(error)
        throw {
            error: error
        }
    }
}

async function getFature(idFature) {
    try {
        const params = { _id: idFature, userId: global.userId }
        const fatureFind = await db.findOne(model.faturesModel, params)
            .populate('bank_id', 'name')

        if (_.isEmpty(fatureFind))
            return utils.makeResponse(203, 'Fatura não encontrada', '')

        return utils.makeResponse(200, 'Fatura encontrada', fatureFind)
    } catch (error) {
        console.log(error)
        throw {
            error: error
        }
    }
}

async function payFature(idFature) {
    try {
        const paramsFature = { _id: idFature, userId: global.userId }
        const fatureFind = await db.findOne(model.faturesModel, paramsFature)
            .populate('bank_id', 'name')

        if (_.isEmpty(fatureFind))
            return utils.makeResponse(203, 'Fatura não encontrada', '')

        const fatureToUpdate = {
            isPayed: true
        }

        await model.faturesModel.updateOne(
            paramsFature,
            fatureToUpdate,
            (err, res) => {
                if (err) {
                    throw new Error(err)
                }
            }
        )

        const paramsTransation = { fature_id: idFature, userId: global.userId }

        const transactionToUpdate = {
            isCompesed: true
        }

        await model.transactionModel.updateMany(
            paramsTransation,
            transactionToUpdate,
            (err, res) => {
                if (err) {
                    throw new Error(err)
                }
            }
        )

        return utils.makeResponse(200, 'Fatura paga', fatureFind)
    } catch (error) {
        console.log(error)
        throw {
            error: error
        }
    }
}

module.exports = {
    getListFatures,
    payFature,
    getFature,
}
