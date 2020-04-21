const _ = require('lodash')
const express = require('express')
const controller = require('../controllers')
const router = express.Router()

router.get('/list', async (req, res, next) => {
    
    try {
        
        const response = await controller.bankController.getListBanks(req.body)
        
        res.status(200).send(response)
    } catch (error) {
        res.status(500).send(error)
    }   

})

router.get('/:idBank', async (req, res, next) => {
    
    const {idBank} = req.params

    try {
        
        const response = await controller.bankController.getBank(idBank)
    
        res.status(200).send(response)
    } catch (error) {
        res.status(500).send(error)
    }   

})

router.post('/create', async (req, res, next) => {
    
    try {
        if (_.isEmpty(req.body))
            throw "No informations on the body"
        
        const response = await controller.bankController.createBank(req.body)
        
        res.status(201).send({
            status: 'Sucesso',
            data: response
        })
    } catch (error) {
        res.status(500).send(error)
    }   

})

router.put('/update/:idBank', async (req, res, next) => {
    
    const {idBank} = req.params

    try {
        if (_.isEmpty(req.body))
            throw "No informations on the body"
        
        const response = await controller.bankController.updateBank(idBank, req.body)
    
        res.status(200).send({
            status: 'Sucesso',
            data: response
        })
    } catch (error) {
        res.status(500).send(error)
    }   

})

router.delete('/delete/:idBank', async (req, res, next) => {
    
    const {idBank} = req.params

    try {
        const response = await controller.bankController.deleteBank(idBank)
    
        res.status(200).send({
            status: 'Sucesso',
            data: response
        })
    } catch (error) {
        res.status(500).send(error)
    }   

})

module.exports = router
