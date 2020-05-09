const _ = require('lodash')
const utils = require('../utils')
const db = require('../database')
const model = require('../model')

async function getListBanks() {
    try {
        const params = { userId: global.userId }
        const bankFind = await db.find(model.bankModel, params)
        if (_.isEmpty(bankFind))
            return utils.makeResponse(203, 'Bancos não encontrados', [])

        return utils.makeResponse(200, 'Lista de Bancos', bankFind)
    } catch (error) {
        throw {
            error: error
        }
    }
}

async function getBank(idBank) {
    try {
        console.log('>>>', idBank)
        const params = { _id: idBank, userId: global.userId }
        const bankFind = await db.findOne(model.bankModel, params)
        if (_.isEmpty(bankFind))
            return utils.makeResponse(203, 'Banco não encontrado')

        return utils.makeResponse(200, 'Banco encontrado', bankFind)
    } catch (error) {
        throw {
            error: error
        }
    }
}

async function createBank(bankToCreate) {
    try {
        const validation = await validateBank(bankToCreate)
        if (validation)
            return utils.makeResponse(203, validation)

        const params = { name: bankToCreate.name, userId: global.userId }
        const bankFind = await db.findOne(model.bankModel, params)
        if (!_.isEmpty(bankFind))
            return utils.makeResponse(203, 'Banco já cadastrado')

        bankToCreate.userId = global.userId
        const bankToSave = new model.bankModel(bankToCreate)
        const response = await db.save(bankToSave)
        return utils.makeResponse(201, 'Banco criado com sucesso', response)
    } catch (error) {
        throw {
            error: error
        }
    }
}

async function updateBank(idBank, bankToUpdate) {
    try {
        const validation = await validateBank(bankToUpdate)
        if (validation)
            return utils.makeResponse(203, validation)

        let param = { name: bankToUpdate.name, userId: global.userId }
        let bankFind = await db.findOne(model.bankModel, param)
        if (!_.isEmpty(bankFind)) {
            if (bankFind._id != idBank)
                return utils.makeResponse(203, 'Banco já cadastrado')
        }

        params = { _id: idBank, userId: global.userId }
        bankFind = await db.findOne(model.bankModel, params)

        if (_.isEmpty(bankFind)) {
            return utils.makeResponse(203, 'Banco não encontrado')
        }

        await model.bankModel.updateOne(
            params,
            bankToUpdate,
            (err, res) => {
                if (err) {
                    throw new Error(err)
                }
            }
        )

        const categoryReturn = await db.findOne(model.bankModel, params)
        return utils.makeResponse(202, 'Banco atualizado com sucesso', categoryReturn)
    } catch (error) {
        throw {
            error: error
        }
    }
}

async function deleteBank(idBank) {
    try {

        const params = { _id: idBank, userId: global.userId }
        const bankFind = await db.findOne(model.bankModel, params)
        if (_.isEmpty(bankFind))
            return utils.makeResponse(203, 'Banco não encontrado')

        const categoryToDelete = new model.bankModel(bankFind)
        const response = await db.remove(categoryToDelete)
        return utils.makeResponse(202, 'Banco removido com sucesso', response)
    } catch (error) {
        throw {
            error: error
        }
    }
}

function validateBank(bankToCreate) {

    requireds = ['name', 'bankType']
    const response = utils.validateRequiredsElements(bankToCreate, requireds)
    if (response)
        return 'Os atributo(s) a seguir não foi(ram) informados: ' + response

    if (bankToCreate.name.length < 3)
        return 'O nome não pode ter menos de 3 caracteres'

    let arr = ['Conta Corrente', 'Conta Cartão', 'Cartão de Crédito', 'Poupança']

    if (!arr.includes(bankToCreate.bankType))
        return 'O tipo de banco não foi informado corretamente'
}

module.exports = {
    getListBanks,
    getBank,
    createBank,
    updateBank,
    deleteBank
}
