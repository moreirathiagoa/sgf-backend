const express = require('express')
const router = express.Router()
const model = require('../model')
const db = require('../database')
const utils = require('../utils')

router.get('/', async (req, res, next) => {
    
    try {

        // const transacao = {
        //     description: 'Oi',
        //     value: 2.00,
        // }

        // let parameter = {_id: '5e9f4ac83779574271a61eeb'}
        // const categoriaFind = await db.findOne(model.categoryModel, parameter)
        // const categoriaModel = model.categoryModel(categoriaFind)
        // transacao.category_id = categoriaModel._id


        // parameter = {_id: '5e9f3c394517842e6003a7f0'}
        // const bankFinded = await db.findOne(model.bankModel,parameter)
        // const bankModel = model.bankModel(bankFinded)
        // transacao.bank_id = bankModel._id

        // const transacoModel = new model.transactionModel(transacao)
        // const resposta = await db.save(transacoModel)

        res.status(200).send({
            title: 'SGF',
            version: '1.0.0',
            message: 'Sistema funcionando perfeitamente!'
        })    
    } catch (error) {
        res.status(500).send({
            title: 'SGF',
            version: '1.0.0',
            message: 'Não Funcionou...',
            error: error.message
        })
    }
    
})

module.exports = router
