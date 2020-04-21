const _ = require('lodash')
const express = require('express')
const controller = require('../controllers')
const router = express.Router()

router.post('/create', async (req, res, next) => {
    
    try {
        if (_.isEmpty(req.body))
            throw "No informations on the body"
        
        res.status(200).send('Sucesso')
    } catch (error) {
        res.status(500).send(error)
    }   

})

router.put('/update/:idBank', async (req, res, next) => {
    
    const {idBank} = req.params

    try {
        if (_.isEmpty(req.body))
            throw "No informations on the body"
        
            res.status(200).send(`Recebido parametro ${idBank}`)
    } catch (error) {
        res.status(500).send(error)
    }   

})

router.delete('/delete/:idBank', async (req, res, next) => {
    
    const {idBank} = req.params

    try {
        if (_.isEmpty(req.params))
            throw "No informations on the body"
        
        res.status(200).send(`Recebido parametro ${idBank}`)
    } catch (error) {
        res.status(500).send(error)
    }   

})

module.exports = router
