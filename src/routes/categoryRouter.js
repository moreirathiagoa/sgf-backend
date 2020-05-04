const _ = require('lodash')
const express = require('express')
const controller = require('../controllers')
const router = express.Router()
const auth = require('../middlewares/auth')

router.get('/list', auth, async (req, res, next) => {
    //console.log(res.locals.authData)
    
    try {
        const response = await controller.categoryController.getListCategory(req.body)
        res.status(response.code).send(response)
    } catch (error) {
        res.status(500).send(error)
    }   

})

router.get('/:idCategory', auth, async (req, res, next) => {
    
    const {idCategory} = req.params
    try {

        const response = await controller.categoryController.getCategory(idCategory)
        res.status(response.code).send(response)

    } catch (error) {
        res.status(500).send(error)
    }   

})

router.post('/create', auth, async (req, res, next) => {
    
    try {
        
        let response
        if (_.isEmpty(req.body)){
            response = utils.makeResponse(204, 'Sem informação no corpo')
        } else {
            response = await controller.categoryController.createCategory(req.body)
        }
        
        res.status(response.code).send(response)
        
    } catch (error) {
        res.status(500).send(error)
    }   

})

router.put('/update/:idCategory', auth, async (req, res, next) => {
    
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

router.delete('/delete/:idCategory', auth, async (req, res, next) => {
    
    const {idCategory} = req.params

    try {
        
        const response = await controller.categoryController.deleteCategory(idCategory)
        res.status(response.code).send(response)

    } catch (error) {
        res.status(500).send(error)
    }   

})

module.exports = router
