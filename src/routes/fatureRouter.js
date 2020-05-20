const _ = require('lodash')
const express = require('express')
const controller = require('../controllers')
const router = express.Router()
const auth = require('../middlewares/auth')

router.get('/list/:bank_id', auth, async (req, res, next) => {
    global.userId = res.locals.authData.userId
    const { bank_id } = req.params
    try {
        const response = await controller.fatureController.getListFatures(bank_id)
        console.log(response)
        res.status(response.code).send(response)
    } catch (error) {
        res.status(500).send(error)
    }

})

module.exports = router
