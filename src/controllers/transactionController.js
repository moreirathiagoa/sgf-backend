const _ = require('lodash')
const utils = require('../utils')
const db = require('../database')
const model = require('../model')

async function getListTransacation(typeTransaction) {
    try {
        const params = { typeTransaction: typeTransaction, userId: global.userId }

        const transactionFind = await db.find(model.transactionModel, params)
            .populate('bank_id', 'name')
            .populate('category_id', 'name')
            .populate('fature_id', 'name')

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
            .populate('fature_id', 'name')
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

        transactionToCreate.efectedDate = utils.formatDateToBataBase(transactionToCreate.efectedDate)
        transactionToCreate.userId = global.userId
        transactionToCreate.createDate = utils.actualDateToBataBase()

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
        if (transactionToCreate.typeTransaction === "cartaoCredito") {
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

                if (transactionToCreate.typeTransaction === "contaCorrente" || transactionToCreate.typeTransaction === "planejamento") {
                    const nextDate = utils.addMonth(transactionToCreate.efectedDate, 1)
                    transactionToCreate.efectedDate = utils.formatDateToBataBase(nextDate)
                }

                if (transactionToCreate.typeTransaction === "cartaoCredito") {
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
            const transactionSaved = await db.save(transactionToSave)

            switch (transactionToCreate.typeTransaction) {
                case 'contaCorrente':
                    await updateSaldoContaCorrente(bankFind._id, transactionSaved.value)
                    break
                case 'cartaoCredito':
                    await updateSaldoFatura(transactionSaved.fature_id, transactionSaved.value)
                    break
                default:
            }

            response.push(transactionSaved)
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

async function updateTransaction(idTransaction, transacationToUpdate) {
    try {
        const validation = await validadeTransaction(transacationToUpdate)
        if (validation)
            return utils.makeResponse(203, validation)

        const params = { _id: idTransaction, userId: global.userId }
        const oldTransaction = await db.findOne(model.transactionModel, params)

        transacationToUpdate.efectedDate = utils.formatDateToBataBase(transacationToUpdate.efectedDate)

        if (_.isEmpty(oldTransaction)) {
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

        const saldoAjust = transactionReturn.value - oldTransaction.value
        switch (transactionReturn.typeTransaction) {
            case 'contaCorrente':
                await updateSaldoContaCorrente(transactionReturn.bank_id, saldoAjust)
                break
            case 'cartaoCredito':
                await updateSaldoFatura(transactionReturn.fature_id, saldoAjust)
                break
            default:
        }

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

        const saldoAjust = -1 * transactionToDelete.value

        switch (transactionToDelete.typeTransaction) {
            case 'contaCorrente':
                await updateSaldoContaCorrente(transactionToDelete.bank_id, saldoAjust)
                break
            case 'cartaoCredito':
                await updateSaldoFatura(transactionToDelete.fature_id, saldoAjust)
                break
            default:
        }

        return utils.makeResponse(202, 'Transação removida com sucesso', response)
    } catch (error) {
        console.log(error)
        throw {
            error: error
        }
    }
}

async function transactionNotCompesedByBank() {
    const params = { userId: global.userId, isCompesed: false }
    let response = await model.transactionModel.aggregate([
        { $match: params },
        { $group: { _id: { bank_id: "$bank_id" }, saldoNotCompesated: { $sum: "$value" } } }
    ])

    let responseToSend = []
    response.forEach((el) => {
        el.bank_id = el._id.bank_id
        delete el._id
        responseToSend.push(el)
    })

    return utils.makeResponse(200, 'Saldo obtido com sucesso', responseToSend)
}

async function transactionNotCompesedDebit() {
    const params = { userId: global.userId, isCompesed: false, value: { $lte: 0 } }
    let response = await model.transactionModel.aggregate([
        { $match: params },
        { $group: { _id: null, saldoNotCompesated: { $sum: "$value" } } }
    ])

    let responseToSend
    if (response.length === 0) {
        responseToSend = 0
    } else {
        responseToSend = response[0].saldoNotCompesated
    }

    return utils.makeResponse(200, 'Saldo obtido com sucesso', responseToSend)
}

async function transactionNotCompesedCredit() {
    const params = { userId: global.userId, isCompesed: false, value: { $gt: 0 } }
    let response = await model.transactionModel.aggregate([
        { $match: params },
        { $group: { _id: null, saldoNotCompesated: { $sum: "$value" } } }
    ])
    let responseToSend
    if (response.length === 0) {
        responseToSend = 0
    } else {

        responseToSend = response[0].saldoNotCompesated
    }

    return utils.makeResponse(200, 'Saldo obtido com sucesso', responseToSend)
}

async function planToPrincipal(transations) {

    const transationToUpdate = {
        isCompesed: false,
        typeTransaction: 'contaCorrente'
    }

    let response = []

    for (let transation of transations) {
        await updateSaldoContaCorrente(transation.bank_id, transation.value)

        const params = { _id: transation._id }
        const transationToReturn = await model.transactionModel.updateOne(
            params,
            transationToUpdate,
            (err, res) => {
                if (err) {
                    console.log(error)
                    throw new Error(err)
                }
            }
        )
        response.push(transationToReturn)
    }

    return utils.makeResponse(201, 'Transação atualizada com sucesso', response)
}

/* FUNÇÕES DE APOIO */

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

async function updateSaldoContaCorrente(idBank, valor) {

    const params = { _id: idBank, userId: global.userId }
    const bankFind = await db.findOne(model.bankModel, params).select('systemBalance')

    const bankToUpdate = { systemBalance: bankFind.systemBalance + valor }

    await model.bankModel.updateOne(
        params,
        bankToUpdate,
        (err, res) => {
            if (err) {
                throw new Error(err)
            }
        }
    )
}

async function updateSaldoFatura(idFatura, valor) {

    const fatureParams = { _id: idFatura, userId: global.userId }
    let fatureFind = await db.findOne(model.faturesModel, fatureParams).select('fatureBalance')

    const fatureToUpdate = { fatureBalance: fatureFind.fatureBalance + valor }

    await model.faturesModel.updateOne(
        fatureParams,
        fatureToUpdate,
        (err, res) => {
            if (err) {
                throw new Error(err)
            }
        }
    )
}

module.exports = {
    getListTransacation,
    getTransaction,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    transactionNotCompesedByBank,
    transactionNotCompesedDebit,
    transactionNotCompesedCredit,
    planToPrincipal,
}
