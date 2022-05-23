const express = require('express')
const controller = require('../controllers')
const router = express.Router()
const auth = require('../middlewares/auth')

router.get('/list/:bankId', auth, async (req, res, next) => {
	global.userId = res.locals.authData.userId
	const { bankId } = req.params
	try {
		const response = await controller.fatureController.getListFatures(bankId)
		res.status(response.code).json(response)
	} catch (error) {
		res.status(500).json(error)
	}
})

router.get('/:fatureId', auth, async (req, res, next) => {
	global.userId = res.locals.authData.userId
	const { fatureId } = req.params
	try {
		const response = await controller.fatureController.getFature(fatureId)
		res.status(response.code).json(response)
	} catch (error) {
		res.status(500).json(error)
	}
})

router.get('/pay/:fatureId', auth, async (req, res, next) => {
	global.userId = res.locals.authData.userId
	const { fatureId } = req.params
	try {
		const response = await controller.fatureController.payFature(fatureId)
		res.status(response.code).json(response)
	} catch (error) {
		res.status(500).json(error)
	}
})

module.exports = router
