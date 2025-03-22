const { isEmpty } = require('lodash')
const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')
const transactionController = require('../controllers/transactionController')

router.post('/create', auth, async (req, res, next) => {
	try {
		const userId = res.locals.authData.userId

		let response
		if (isEmpty(req.body)) {
			response = utils.makeResponse(204, 'Sem informação no corpo')
		} else {
			response = await transactionController.createTransaction(userId, req.body)
		}
		res.status(response.code).json(response)
	} catch (error) {
		res.status(500).json(error)
	}
})

router.put('/update/:transactionId', auth, async (req, res, next) => {
	try {
		const userId = res.locals.authData.userId
		const { transactionId } = req.params

		let response
		if (isEmpty(req.body)) {
			response = utils.makeResponse(204, 'Sem informação no corpo')
		} else {
			response = await transactionController.updateTransaction(
				userId,
				transactionId,
				req.body
			)
		}
		res.status(response.code).json(response)
	} catch (error) {
		res.status(500).json(error)
	}
})

router.post('/bank-transfer', auth, async (req, res, next) => {
	try {
		const userId = res.locals.authData.userId

		let response
		if (isEmpty(req.body)) {
			response = utils.makeResponse(204, 'Sem informação no corpo')
		} else {
			response = await transactionController.bankTransference(userId, req.body)
		}
		res.status(response.code).json(response)
	} catch (error) {
		res.status(500).json(error)
	}
})

router.delete('/delete/:transactionId', auth, async (req, res, next) => {
	try {
		const userId = res.locals.authData.userId
		const { transactionId } = req.params
		const response = await transactionController.deleteTransaction(
			userId,
			transactionId
		)
		res.status(response.code).json(response)
	} catch (error) {
		res.status(500).json(error)
	}
})

router.post('/planToPrincipal', auth, async (req, res, next) => {
	try {
		const userId = res.locals.authData.userId

		let response
		if (isEmpty(req.body)) {
			response = utils.makeResponse(204, 'Sem informação no corpo')
		} else {
			response = await transactionController.planToPrincipal(userId, req.body)
		}
		res.status(response.code).json(response)
	} catch (error) {
		res.status(500).json(error)
	}
})

router.get('/:transactionId', auth, async (req, res, next) => {
	try {
		const userId = res.locals.authData.userId
		const { transactionId } = req.params
		const response = await transactionController.getTransaction(
			userId,
			transactionId
		)
		res.status(response.code).json(response)
	} catch (error) {
		res.status(500).json(error)
	}
})

module.exports = router
