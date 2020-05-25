const _ = require('lodash')
const express = require('express')
const controller = require('../controllers')
const router = express.Router()
const auth = require('../middlewares/auth')

router.get('/list/:typeTransaction', auth, async (req, res, next) => {
    global.userId = res.locals.authData.userId
    const { typeTransaction } = req.params
    try {
        const response = await controller.transactionController.getListTransacation(typeTransaction)
        res.status(response.code).send(response)
    } catch (error) {
        res.status(500).send(error)
    }

})

router.post('/filter', auth, async (req, res, next) => {
    global.userId = res.locals.authData.userId
    try {

        let response
        if (_.isEmpty(req.body)) {
            response = utils.makeResponse(204, 'Sem informação no corpo')
        } else {
            response = await controller.transactionController.getFilterTransacation(req.body)
        }
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
            response = await controller.transactionController.createTransaction(req.body)
        }
        res.status(response.code).send(response)

    } catch (error) {
        res.status(500).send(error)
    }

})

router.put('/update/:idTransaction', auth, async (req, res, next) => {
    global.userId = res.locals.authData.userId
    const { idTransaction } = req.params

    try {
        let response
        if (_.isEmpty(req.body)) {
            response = utils.makeResponse(204, 'Sem informação no corpo')
        }
        else {
            response = await controller.transactionController.updateTransaction(idTransaction, req.body)
        }
        res.status(response.code).send(response)

    } catch (error) {
        res.status(500).send(error)
    }

})

router.delete('/delete/:idTransaction', auth, async (req, res, next) => {
    global.userId = res.locals.authData.userId
    const { idTransaction } = req.params

    try {

        const response = await controller.transactionController.deleteTransaction(idTransaction)
        res.status(response.code).send(response)

    } catch (error) {
        res.status(500).send(error)
    }

})

router.get('/not-compensated-by-bank', auth, async (req, res, next) => {
    global.userId = res.locals.authData.userId
    try {
        const response = await controller.transactionController.transactionNotCompesedByBank()
        res.status(response.code).send(response)
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }

})

router.get('/not-compensated-credit', auth, async (req, res, next) => {
    global.userId = res.locals.authData.userId
    try {
        const response = await controller.transactionController.transactionNotCompesedCredit()
        res.status(response.code).send(response)
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }

})

router.get('/not-compensated-debit', auth, async (req, res, next) => {
    global.userId = res.locals.authData.userId
    try {
        const response = await controller.transactionController.transactionNotCompesedDebit()
        res.status(response.code).send(response)
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }

})

router.post('/planToPrincipal', auth, async (req, res, next) => {
    global.userId = res.locals.authData.userId
    try {
        let response
        if (_.isEmpty(req.body)) {
            response = utils.makeResponse(204, 'Sem informação no corpo')
        } else {
            response = await controller.transactionController.planToPrincipal(req.body)
        }
        res.status(response.code).send(response)

    } catch (error) {
        res.status(500).send(error)
    }

})

router.get('/:idTransaction', auth, async (req, res, next) => {
    global.userId = res.locals.authData.userId
    const { idTransaction } = req.params
    try {
        const response = await controller.transactionController.getTransaction(idTransaction)
        res.status(response.code).send(response)
    } catch (error) {
        res.status(500).send(error)
    }

})

module.exports = router
