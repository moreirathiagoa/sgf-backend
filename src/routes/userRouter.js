const _ = require('lodash')
const express = require('express')
const controller = require('../controllers')
const router = express.Router()
const auth = require('../middlewares/auth')

router.get('/list', auth, async (req, res, next) => {
    try {
        const response = await controller.userController.getListUsers()
        res.status(response.code).send(response)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/:idUser', auth, async (req, res, next) => {

    const { idUser } = req.params
    try {

        const response = await controller.userController.getUser(idUser)
        res.status(response.code).send(response)

    } catch (error) {
        res.status(500).send(error)
    }

})

router.post('/create', auth, async (req, res, next) => {

    try {

        let response
        if (_.isEmpty(req.body)) {
            response = utils.makeResponse(204, 'Sem informação no corpo')
        } else {
            response = await controller.userController.createUser(req.body)
        }

        res.status(response.code).send(response)

    } catch (error) {
        res.status(500).send(error)
    }

})

router.put('/update/:idUser', auth, async (req, res, next) => {

    const { idUser } = req.params

    try {

        let response
        if (_.isEmpty(req.body)) {
            response = utils.makeResponse(204, 'Sem informação no corpo')
        }
        else {
            response = await controller.userController.updateUser(idUser, req.body)
        }
        res.status(response.code).send(response)

    } catch (error) {
        res.status(500).send(error)
    }

})

module.exports = router
