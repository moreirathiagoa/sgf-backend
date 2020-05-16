const _ = require('lodash')
const express = require('express')
const controller = require('../controllers')
const router = express.Router()
const auth = require('../middlewares/auth')

router.get('/list/:typeTransaction', auth, async (req, res, next) => {
    global.userId = res.locals.authData.userId
    const { typeTransaction } = req.params
    try {
        const response = await controller.bankController.getListBanks(typeTransaction)
        res.status(response.code).send(response)
    } catch (error) {
        res.status(500).send(error)
    }

})

router.get('/:idBank', auth, async (req, res, next) => {
    global.userId = res.locals.authData.userId
    const { idBank } = req.params
    try {

        const response = await controller.bankController.getBank(idBank)
        res.status(response.code).send(response)

    } catch (error) {
        res.status(500).send(error)
    }

})

router.post('/create', auth, async (req, res, next) => {
    global.userId = res.locals.authData.userId
    try {

        let response
        if (_.isEmpty(req.body)) {
            response = utils.makeResponse(204, 'Sem informação no corpo')
        } else {
            response = await controller.bankController.createBank(req.body)
        }

        res.status(response.code).send(response)

    } catch (error) {
        res.status(500).send(error)
    }

})

router.put('/update/:idBank', auth, async (req, res, next) => {
    global.userId = res.locals.authData.userId
    const { idBank } = req.params

    try {

        let response
        if (_.isEmpty(req.body)) {
            response = utils.makeResponse(204, 'Sem informação no corpo')
        }
        else {
            response = await controller.bankController.updateBank(idBank, req.body)
        }
        res.status(response.code).send(response)

    } catch (error) {
        res.status(500).send(error)
    }

})

router.delete('/delete/:idBank', auth, async (req, res, next) => {
    global.userId = res.locals.authData.userId
    const { idBank } = req.params

    try {
        const response = await controller.bankController.deleteBank(idBank)

        res.status(response.code).send(response)
    } catch (error) {
        res.status(500).send(error)
    }

})

module.exports = router
