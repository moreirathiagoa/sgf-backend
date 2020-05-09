const _ = require('lodash')
const utils = require('../utils')
const db = require('../database')
const model = require('../model')

async function getListTransacation() {
    try {
        const params = { userId: global.userId }
        const transactionFind = await db.find(model.transactionModel, params)
        if (_.isEmpty(transactionFind))
            return utils.makeResponse(203, 'Transação não encontradas', [])

        return utils.makeResponse(200, 'Lista de Transações', transactionFind)
    } catch (error) {
        throw {
            error: error
        }
    }
}

async function getFilterTransacation(filters) {
    try {
        filters.userId = global.userId
        const params = filters
        const transactionFind = await db.find(model.transactionModel, params)
        if (_.isEmpty(transactionFind))
            return utils.makeResponse(203, 'Transação não encontradas', [])

        return utils.makeResponse(200, 'Lista de Transações', transactionFind)
    } catch (error) {
        throw {
            error: error
        }
    }
}

async function getTransaction(idTransaction) {
    try {

        const params = { _id: idTransaction, userId: global.userId }
        const transactionFind = await db.findOne(model.transactionModel, params)
        if (_.isEmpty(transactionFind))
            return utils.makeResponse(203, 'Transação não encontradas', [])

        return utils.makeResponse(200, 'Transação encontrada', transactionFind)
    } catch (error) {
        throw {
            error: error
        }
    }
}

async function createTransaction(transactionToCreate) {
    try {
        const validation = await validadeTransaction(transactionToCreate)
        if (validation)
            return utils.makeResponse(203, validation)

        transactionToCreate.userId = global.userId
        transactionToCreate.efectedDate = utils.getDateInformed(transactionToCreate.efectedDate)
        transactionToCreate.createDate = utils.getMomentNow()
        
        const transactionToSave = new model.transactionModel(transactionToCreate)
        const response = await db.save(transactionToSave)
        return utils.makeResponse(201, 'Transação criada com sucesso', response)
    } catch (error) {
        throw {
            error: error
        }
    }
}

async function updateTransaction(idTransaction, transacationToUpdate) {
    try {
        const validation = await validadeTransaction(transacationToUpdate)
        if (validation)
            return utils.makeResponse(203, validation)

        const params = { _id: idTransaction, userId: global.userId }
        const transactionFind = await db.findOne(model.transactionModel, params)

        if (_.isEmpty(transactionFind)) {
            return utils.makeResponse(203, 'Transação não encontrada')
        }

        await model.transactionModel.updateOne(
            params,
            transacationToUpdate,
            (err, res) => {
                if (err) {
                    throw new Error(err)
                }
            }
        )

        const transactionReturn = await db.findOne(model.transactionModel, params)
        return utils.makeResponse(202, 'Categoria atualizada com sucesso', transactionReturn)
    } catch (error) {
        throw {
            error: error
        }
    }
}

async function deleteTransaction(idTransaction) {
    try {

        const params = { _id: idTransaction, userId: global.userId }
        const transactionFind = await db.findOne(model.transactionModel, params)
        if (_.isEmpty(transactionFind))
            return utils.makeResponse(203, 'Transação não encontrada')

        const transactionToDelete = new model.transactionModel(transactionFind)
        const response = await db.remove(transactionToDelete)
        return utils.makeResponse(201, 'Transação removida com sucesso', response)
    } catch (error) {
        throw {
            error: error
        }
    }
}

async function validadeTransaction(transactionToCreate) {

    requireds = ['category_id', 'bank_id', 'value']
    const response = utils.validateRequiredsElements(transactionToCreate, requireds)
    if (response)
        return 'Os atributo(s) a seguir não foi(ram) informados: ' + response

    if (!utils.isNumeric(transactionToCreate.value))
        return 'Valor informado não é válido'

    if (!await existCategory(transactionToCreate.category_id))
        return 'Categoria não encontrada'

    if (!await existBank(transactionToCreate.bank_id))
        return 'Banco não encontrado'

}

async function existCategory(idCategory) {
    const params = { _id: idCategory }
    const categoryFind = await db.findOne(model.categoryModel, params)
    if (_.isEmpty(categoryFind))
        return false
    return true
}

async function existBank(idBank) {
    const params = { _id: idBank }
    const bankFind = await db.findOne(model.bankModel, params)
    if (_.isEmpty(bankFind))
        return false
    return true
}

module.exports = {
    getListTransacation,
    getFilterTransacation,
    getTransaction,
    createTransaction,
    updateTransaction,
    deleteTransaction
}
