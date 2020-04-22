const _ = require('lodash')
const express = require('express')
const controller = require('../controllers')
const router = express.Router()

router.get('/list', async (req, res, next) => {
    
    try {
        
        const response = await controller.transactionController.getListTransacation()
        
        res.status(200).send(response)
    } catch (error) {
        res.status(500).send(error)
    }   

})

router.post('/filter', async (req, res, next) => {
    
    try {

        if (_.isEmpty(req.body))
            throw "No informations on the body"
        
        const response = await controller.transactionController.getFilterTransacation(req.body)
        
        res.status(200).send(response)
    } catch (error) {
        res.status(500).send(error)
    }   

})

router.get('/:idTransaction', async (req, res, next) => {
    
    const {idTransaction} = req.params

    try {
        
        const response = await controller.transactionController.getTransaction(idTransaction)
    
        res.status(200).send(response)
    } catch (error) {
        res.status(500).send(error)
    }   

})

router.post('/create', async (req, res, next) => {
    
    try {
        if (_.isEmpty(req.body))
            throw "No informations on the body"
        
        const response = await controller.transactionController.createTransaction(req.body)
        
        res.status(201).send({
            status: 'Sucesso',
            data: response
        })
    } catch (error) {
        res.status(500).send(error)
    }   

})

router.put('/update/:idTransaction', async (req, res, next) => {
    
    const {idTransaction} = req.params

    try {
        if (_.isEmpty(req.body))
            throw "No informations on the body"
        
        const response = await controller.transactionController.updateTransaction(idTransaction, req.body)
    
        res.status(200).send({
            status: 'Sucesso',
            data: response
        })
    } catch (error) {
        res.status(500).send(error)
    }   

})

router.delete('/delete/:idTransaction', async (req, res, next) => {
    
    const {idTransaction} = req.params

    try {
        const response = await controller.transactionController.deleteTransaction(idTransaction)
    
        res.status(200).send({
            status: 'Sucesso',
            data: response
        })
    } catch (error) {
        res.status(500).send(error)
    }   

})

module.exports = router
