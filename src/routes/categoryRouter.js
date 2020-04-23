const _ = require('lodash')
const express = require('express')
const controller = require('../controllers')
const router = express.Router()

router.get('/list', async (req, res, next) => {
    res.header('Access-Control-Allow-Origin','*')
    try {
        
        const response = await controller.categoryController.getListCategory(req.body)
        
        res.status(response.code).send(response)
    } catch (error) {
        res.status(500).send(error)
    }   

})

router.get('/:idCategory', async (req, res, next) => {
    res.header('Access-Control-Allow-Origin','*')
    const {idCategory} = req.params
    try {

        const response = await controller.categoryController.getCategory(idCategory)
        res.status(response.code).send(response)

    } catch (error) {
        res.status(500).send(error)
    }   

})

router.post('/create',  async (req, res, next) => {
    res.header('Access-Control-Allow-Origin','*')
    try {
        
        let response
        if (_.isEmpty(req.body)){
            response = utils.makeResponse(204, 'Sem informação no corpo')
        }
        else{
            response = await controller.categoryController.createCategory(req.body)
        }
        
        res.status(response.code).send(response)
        
    } catch (error) {
        console.log(error);
        
        res.status(500).send(error)
    }   

})

router.put('/update/:idCategory', async (req, res, next) => {
    res.header('Access-Control-Allow-Origin','*')
    const {idCategory} = req.params

    try {

        let response
        if (_.isEmpty(req.body)){
            response = utils.makeResponse(204, 'Sem informação no corpo')
        }
        else{
            response = await controller.categoryController.updateCategory(idCategory, req.body)
        }
        res.status(response.code).send(response)

    } catch (error) {
        res.status(500).send(error)
    }   

})

router.delete('/delete/:idCategory', async (req, res, next) => {
    res.header('Access-Control-Allow-Origin','*')
    const {idCategory} = req.params

    try {
        
        const response = await controller.categoryController.deleteCategory(idCategory)
        res.status(response.code).send(response)

    } catch (error) {
        res.status(500).send(error)
    }   

})

module.exports = router
