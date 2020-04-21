const express = require('express')
const router = express.Router()
const factory = require('../factory')
const model = require('../model')
const db = require('../database')

/**
 * @swagger
 * /:
 *   get:
 *     summary: Home
 *     description: >-
 *       Possibilita verificar se a aplicação está respondendo na home sem problemas
 *     responses:
 *       '200':
 *         description: Yoda {version number}
 */
router.get('/', (req, res, next) => {

    try {
        const response = factory.response.responseFactory('200', 'teste2', {})
        const modelResponse = new model.responseModel(response)
        db.save(modelResponse)

        res.status(200).send({
            title: 'SGF',
            version: '1.0.0',
            message: 'Funcionando!'
        })    
    } catch (error) {
        res.status(500).send({
            title: 'SGF',
            version: '1.0.0',
            message: 'Não Funcionou...'
        })
    }   

    
})

module.exports = router
