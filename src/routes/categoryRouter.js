const _ = require('lodash')
const express = require('express')
const controller = require('../controllers')
const router = express.Router()

router.post('/create', async (req, res, next) => {
    
    try {
        if (_.isEmpty(req.body))
            throw "No informations on the body"
        
        const response = await controller.categoryController.createCategory(req.body)
        
        res.status(201).send({
            status: 'Sucesso',
            data: response
        })
    } catch (error) {
        res.status(500).send(error)
    }   

})

router.put('/update/:idCategory', async (req, res, next) => {
    
    const {idCategory} = req.params

    try {
        if (_.isEmpty(req.body))
            throw "No informations on the body"
        
        const response = await controller.categoryController.updateCategory(idCategory, req.body)
    
        res.status(200).send({
            status: 'Sucesso',
            data: response
        })
    } catch (error) {
        res.status(500).send(error)
    }   

})

router.delete('/delete/:idCategory', async (req, res, next) => {
    
    const {idCategory} = req.params

    try {
        
        const response = await controller.categoryController.deleteCategory(idCategory)
    
        res.status(200).send({
            status: 'Sucesso',
            data: response
        })
    } catch (error) {
        res.status(500).send(error)
    }   

})

module.exports = router
