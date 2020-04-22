const _ = require('lodash')
const utils = require('../utils')
const db = require('../database')
const model = require('../model')

async function getListTransacation(){
    try {
        const transactionFind = await db.find(model.transactionModel)
        if (_.isEmpty(transactionFind))
            throw 'Nenhum dado para exibir'

        return transactionFind
    } catch (error) {
        throw {
            error: error
        }
    }
}

async function getFilterTransacation(filters){
    try {

        const params = filters
        const transactionFind = await db.find(model.transactionModel, params)
        if (_.isEmpty(transactionFind))
            throw 'Nenhum dado para exibir'

        return transactionFind
    } catch (error) {
        throw {
            error: error
        }
    }
}

async function getTransaction(idTransaction){
    try {

        const params = { _id: idTransaction }
        const transactionFind = await db.findOne(model.transactionModel, params)
        if (_.isEmpty(transactionFind))
            throw 'Nenhum dado para exibir'

        return transactionFind
    } catch (error) {
        throw {
            error: error
        }
    }
}

async function createTransaction(transactionToCreate){
    try {
        await validadeTransaction(transactionToCreate)

        const transactionToSave = new model.transactionModel(transactionToCreate)
        const response = await db.save(transactionToSave)
        return response
    } catch (error) {
        throw {
            error: error
        }
    }
}

async function updateTransaction(idTransaction, transacationToUpdate){
    try {
        await validadeTransaction(transacationToUpdate)

        const params = { _id: idTransaction }
        const transactionFind = await db.findOne(model.transactionModel, params)

        if (_.isEmpty(transactionFind)) {
            throw 'Transacação não encontrada'
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

        return transactionReturn
    } catch (error) {
        throw {
            error: error
        }
    }
}

async function deleteTransaction(idTransaction){
    try {
        
        const params = { _id: idTransaction }
        const transactionFind = await db.findOne(model.transactionModel, params)
        if (_.isEmpty(transactionFind))
            throw 'Transacação não encontrada'

        const transactionToDelete = new model.transactionModel(transactionFind)
        const response = await db.remove(transactionToDelete)
        return response
    } catch (error) {
        throw {
            error: error
        }
    }
}

async function validadeTransaction(transactionToCreate){
    
    requireds = ['category_id', 'bank_id', 'value']
    const response = utils.validateRequiredsElements(transactionToCreate, requireds)
    if(response)
        throw 'Os atributo(s) a seguir não foi(ram) informados: ' + response
    
    if(!utils.isNumeric(transactionToCreate.value))
        throw 'Valor informado não é válido'
    
    if(!await existCategory(transactionToCreate.category_id))
        throw 'Categoria não encontrada'

    if(!await existBank(transactionToCreate.bank_id))
        throw 'Banco não encontrado'
        
}

async function existCategory(idCategory){
    const params = { _id: idCategory }
    const categoryFind = await db.findOne(model.categoryModel, params)
    if (_.isEmpty(categoryFind))
        return false
    return true
}

async function existBank(idBank){
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
