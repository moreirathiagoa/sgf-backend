const { isEmpty, get } = require('lodash')
const express = require('express')
const controller = require('../controllers')
const router = express.Router()
const auth = require('../middlewares/auth')

router.post('/create', auth, async (req, res, next) => {
	global.userId = res.locals.authData.userId
	try {
		let response
		if (isEmpty(req.body)) {
			response = utils.makeResponse(204, 'Sem informação no corpo')
		} else {
			response = await controller.transaction.createTransaction(req.body)
		}
		res.status(response.code).json(response)
	} catch (error) {
		res.status(500).json(error)
	}
})

router.put('/update/:idTransaction', auth, async (req, res, next) => {
	global.userId = res.locals.authData.userId
	const { idTransaction } = req.params
	try {
		let response
		if (isEmpty(req.body)) {
			response = utils.makeResponse(204, 'Sem informação no corpo')
		} else {
			response = await controller.transaction.updateTransaction(
				idTransaction,
				req.body
			)
		}
		res.status(response.code).json(response)
	} catch (error) {
		res.status(500).json(error)
	}
})

router.post('/bank-transfer', auth, async (req, res, next) => {
	global.userId = res.locals.authData.userId
	try {
		let response
		if (isEmpty(req.body)) {
			response = utils.makeResponse(204, 'Sem informação no corpo')
		} else {
			response = await controller.transaction.bankTransference(req.body)
		}
		res.status(response.code).json(response)
	} catch (error) {
		res.status(500).json(error)
	}
})

router.delete('/delete/:idTransaction', auth, async (req, res, next) => {
	global.userId = res.locals.authData.userId
	const { idTransaction } = req.params

	try {
		const response = await controller.transaction.deleteTransaction(
			idTransaction
		)
		res.status(response.code).json(response)
	} catch (error) {
		res.status(500).json(error)
	}
})

router.post('/planToPrincipal', auth, async (req, res, next) => {
	global.userId = res.locals.authData.userId
	try {
		let response
		if (isEmpty(req.body)) {
			response = utils.makeResponse(204, 'Sem informação no corpo')
		} else {
			response = await controller.transaction.planToPrincipal(req.body)
		}
		res.status(response.code).json(response)
	} catch (error) {
		res.status(500).json(error)
	}
})

router.get('/:idTransaction', auth, async (req, res, next) => {
	global.userId = res.locals.authData.userId
	const { idTransaction } = req.params
	try {
		const response = await controller.transaction.getTransaction(idTransaction)
		res.status(response.code).json(response)
	} catch (error) {
		res.status(500).json(error)
	}
})

module.exports = router
