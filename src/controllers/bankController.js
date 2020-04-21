const _ = require('lodash')
const utils = require('../utils')
const db = require('../database')
const model = require('../model')

async function createBank(bankToCreate){
    try {
        await validateBank(bankToCreate)

        const params = { name: bankToCreate.name }
        const bankFind = await db.findOne(model.bankModel, params)
        if (!_.isEmpty(bankFind))
            throw 'Banco já cadastrado'

        const bankToSave = new model.bankModel(bankToCreate)
        const response = await db.save(bankToSave)
        return response
    } catch (error) {
        throw {
            error: error
        }
    }
}

async function updateBank(idBank, bankToUpdate){
    try {
        await validateBank(bankToUpdate)

        let param = { name: bankToUpdate.name }
        let bankFind = await db.findOne(model.bankModel, param)
        if (!_.isEmpty(bankFind)){
            if(bankFind._id != idBank)
                throw 'Banco já cadastrado'
        }

        params = { _id: idBank }
        bankFind = await db.findOne(model.bankModel, params)

        if (_.isEmpty(bankFind)) {
            throw 'Banco não encontrado'
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

        return categoryReturn
    } catch (error) {
        throw {
            error: error
        }
    }
}

async function deleteBank(idBank){
    try {
        
        const params = { _id: idBank }
        const bankFind = await db.findOne(model.bankModel, params)
        if (_.isEmpty(bankFind))
            throw 'Banco não encontrada'

        const categoryToDelete = new model.bankModel(bankFind)
        const response = await db.remove(categoryToDelete)
        return response
    } catch (error) {
        throw {
            error: error
        }
    }
}

function validateBank(bankToCreate){
    
    requireds = ['name', 'bankType']
    const response = utils.validateRequiredsElements(bankToCreate, requireds)
    if(response)
        throw 'Os atributo(s) a seguir não foi(ram) informados: ' + response
    
    if (bankToCreate.name.lenght < 3)
        throw 'O nome não pode ter menos de 3 caracteres'

    let arr = ['Conta Corrente', 'Conta Cartão', 'Cartão de Crédito', 'Poupança']

    if (!arr.includes(bankToCreate.bankType))
        throw 'O tipo de banco não foi informado corretamente'
}

module.exports = {
    createBank,
    updateBank,
    deleteBank
}
