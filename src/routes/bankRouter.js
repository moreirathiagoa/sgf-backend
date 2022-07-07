const { isEmpty } = require('lodash')
const express = require('express')
const controller = require('../controllers')
const router = express.Router()
const auth = require('../middlewares/auth')

router.get('/list/:typeTransaction', auth, async (req, res, next) => {
	global.userId = res.locals.authData.userId
	const { typeTransaction } = req.params
	try {
		const response = await controller.bank.getListBanks(typeTransaction)
		res.status(response.code).json(response)
	} catch (error) {
		res.status(500).json(error)
	}
})

router.get('/:idBank', auth, async (req, res, next) => {
	global.userId = res.locals.authData.userId
	const { idBank } = req.params
	try {
		const response = await controller.bank.getBank(idBank)
		res.status(response.code).json(response)
	} catch (error) {
		res.status(500).json(error)
	}
})

router.post('/create', auth, async (req, res, next) => {
	global.userId = res.locals.authData.userId
	try {
		let response
		if (isEmpty(req.body)) {
			response = utils.makeResponse(204, 'Sem informação no corpo')
		} else {
			response = await controller.bank.createBank(req.body)
		}

		res.status(response.code).json(response)
	} catch (error) {
		res.status(500).json(error)
	}
})

router.put('/update/:idBank', auth, async (req, res, next) => {
	global.userId = res.locals.authData.userId
	const { idBank } = req.params

	try {
		let response
		if (isEmpty(req.body)) {
			response = utils.makeResponse(204, 'Sem informação no corpo')
		} else {
			response = await controller.bank.updateBank(idBank, req.body)
		}
		res.status(response.code).json(response)
	} catch (error) {
		res.status(500).json(error)
	}
})

router.delete('/delete/:idBank', auth, async (req, res, next) => {
	global.userId = res.locals.authData.userId
	const { idBank } = req.params

	try {
		const response = await controller.bank.deleteBank(idBank)

		res.status(response.code).json(response)
	} catch (error) {
		res.status(500).json(error)
	}
})

module.exports = router
