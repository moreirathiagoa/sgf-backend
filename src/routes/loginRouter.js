const { isEmpty } = require('lodash')
const express = require('express')
const router = express.Router()
const loginController = require('../controllers/loginController')

router.post('/', async (req, res, next) => {
	try {
		let response
		if (isEmpty(req.body)) {
			response = utils.makeResponse(204, 'Sem informação no corpo')
		} else {
			response = await loginController.login(req.body)
		}
		res.status(response.code).json(response)
	} catch (error) {
		res.status(500).json(error)
	}
})
module.exports = router
