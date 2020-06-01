const _ = require('lodash')
const express = require('express')
const controller = require('../controllers')
const router = express.Router()

router.post('/', async (req, res, next) => {
	try {
		let response
		if (_.isEmpty(req.body)) {
			response = utils.makeResponse(204, 'Sem informação no corpo')
		} else {
			response = await controller.loginController.login(req.body)
		}
		res.status(response.code).send(response)
	} catch (error) {
		res.status(500).send(error)
	}
})
module.exports = router
