const _ = require('lodash')
const utils = require('../utils')
const db = require('../database')
const model = require('../model')

async function getListTransacation() {
    try {
        const params = { userId: global.userId }

        const transactionFind = await db.find(model.transactionModel, params)
            .populate('bank_id', 'name')
            .populate('category_id', 'name')

        if (_.isEmpty(transactionFind))
            return utils.makeResponse(203, 'Transação não encontradas', [])

        return utils.makeResponse(200, 'Lista de Transações', transactionFind)
    } catch (error) {
        console.log(error)
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
        console.log(error)
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
        console.log(error)
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
        transactionToCreate.efectedDate = new Date(utils.getDateInformed(transactionToCreate.efectedDate))
        transactionToCreate.createDate = new Date()
        if (!transactionToCreate.isCredit) {
            transactionToCreate.value = -1 * transactionToCreate.value
        }

        let totalTransaction = 1
        if (transactionToCreate.finalRecurrence) {
            totalTransaction = transactionToCreate.finalRecurrence

            if (transactionToCreate.isSimples) {
                delete transactionToCreate.finalRecurrence
            } else {
                if (transactionToCreate.finalRecurrence == 1) {
                    delete transactionToCreate.finalRecurrence
                } else {
                    transactionToCreate.currentRecurrence = 1
                }
            }
        }

        const bankParams = { _id: transactionToCreate.bank_id, userId: global.userId }
        const bankFind = await db.findOne(model.bankModel, bankParams)
        let fature
        if (bankFind.bankType === "Cartão de Crédito") {
            fature = await getFature(transactionToCreate.fature, bankFind._id)
            delete transactionToCreate.fature
            transactionToCreate.fature_id = fature._id
        }

        let response = []
        for (let i = 0; i < totalTransaction; i++) {

            if (i > 0) {

                if (!transactionToCreate.isSimples) {
                    transactionToCreate.currentRecurrence++
                }

                if (bankFind.bankType === "Conta Corrente" || bankFind.bankType === "Conta Cartão") {
                    let dataInicial = new Date(transactionToCreate.efectedDate)
                    let dataFinal = new Date(dataInicial.setMonth(dataInicial.getMonth() + 1));
                    transactionToCreate.efectedDate = dataFinal
                }

                if (bankFind.bankType === "Cartão de Crédito") {
                    let now = new Date(fature.name.replace('/', '-') + '-10')
                    now.setDate(now.getDate() + 30)

                    const mes = now.getMonth() + 1
                    const ano = now.getFullYear()
                    let mesFinal = '00' + mes
                    mesFinal = mesFinal.substr(mesFinal.length - 2)
                    let fatureName = ano + '/' + mesFinal

                    fature = await getFature(fatureName, bankFind._id)
                    transactionToCreate.fature_id = fature._id
                }
            }
            const transactionToSave = new model.transactionModel(transactionToCreate)
            response.push(await db.save(transactionToSave))
        }

        if (response.length == 0)
            return utils.makeResponse(203, 'A transação não pode ser salva')

        return utils.makeResponse(201, 'Transação criada com sucesso', response)
    } catch (error) {
        console.log(error)
        throw {
            error: error
        }
    }
}

async function getFature(fatureName, bank_id) {

    const fatureParams = { name: fatureName, bank_id: bank_id, userId: global.userId }
    let fature = await db.findOne(model.faturesModel, fatureParams)

    if (!fature) {

        fature = {
            userId: global.userId,
            name: fatureName,
            createDate: new Date(),
            bank_id: bank_id
        }
        fature = new model.faturesModel(fature)
        await db.save(fature)
    }

    return fature
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
                    console.log(error)
                    throw new Error(err)
                }
            }
        )

        const transactionReturn = await db.findOne(model.transactionModel, params)
        return utils.makeResponse(202, 'Categoria atualizada com sucesso', transactionReturn)
    } catch (error) {
        console.log(error)
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
        console.log(error)
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

    if (transactionToCreate.finalRecurrence <= 0)
        return 'Recorrência menor ou igual a zero. Deixe em branco em caso de única transação.'

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
