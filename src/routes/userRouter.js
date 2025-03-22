const { isEmpty } = require('lodash')
const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')
const userController = require('../controllers/userController')

router.get('/list', auth, async (req, res, next) => {
	try {
		const response = await userController.getListUsers()
		res.status(response.code).json(response)
	} catch (error) {
		res.status(500).json(error)
	}
})

router.get('/:idUser', auth, async (req, res, next) => {
	const { idUser } = req.params
	try {
		const response = await userController.getUser(idUser)
		res.status(response.code).json(response)
	} catch (error) {
		res.status(500).json(error)
	}
})

router.post('/create', auth, async (req, res, next) => {
	try {
		let response
		if (isEmpty(req.body)) {
			response = utils.makeResponse(204, 'Sem informação no corpo')
		} else {
			response = await userController.createUser(req.body)
		}

		res.status(response.code).json(response)
	} catch (error) {
		res.status(500).json(error)
	}
})

router.put('/update/:idUser', auth, async (req, res, next) => {
	const { idUser } = req.params

	try {
		let response
		if (isEmpty(req.body)) {
			response = utils.makeResponse(204, 'Sem informação no corpo')
		} else {
			response = await userController.updateUser(idUser, req.body)
		}
		res.status(response.code).json(response)
	} catch (error) {
		res.status(500).json(error)
	}
})

module.exports = router
