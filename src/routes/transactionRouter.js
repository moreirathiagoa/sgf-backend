const { isEmpty } = require('lodash')
const express = require('express')
const controller = require('../controllers')
const router = express.Router()
const { get } = require('lodash')
const auth = require('../middlewares/auth')

router.post('/list/:typeTransaction', auth, async (req, res, next) => {
	global.userId = res.locals.authData.userId
	const { typeTransaction } = req.params

	const filters = get(req, 'body.filters', null)

	try {
		const response = await controller.transactionController.getListTransaction(
			typeTransaction,
			filters
		)
		res.status(response.code).send(response)
	} catch (error) {
		res.status(500).send(error)
	}
})

router.post('/create', auth, async (req, res, next) => {
	global.userId = res.locals.authData.userId
	try {
		let response
		if (isEmpty(req.body)) {
			response = utils.makeResponse(204, 'Sem informação no corpo')
		} else {
			response = await controller.transactionController.createTransaction(
				req.body
			)
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
		if (isEmpty(req.body)) {
			response = utils.makeResponse(204, 'Sem informação no corpo')
		} else {
			response = await controller.transactionController.updateTransaction(
				idTransaction,
				req.body
			)
		}
		res.status(response.code).send(response)
	} catch (error) {
		res.status(500).send(error)
	}
})

router.post('/bank-transfer', auth, async (req, res, next) => {
	global.userId = res.locals.authData.userId
	try {
		let response
		if (isEmpty(req.body)) {
			response = utils.makeResponse(204, 'Sem informação no corpo')
		} else {
			response = await controller.transactionController.bankTransference(
				req.body
			)
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
		const response = await controller.transactionController.deleteTransaction(
			idTransaction
		)
		res.status(response.code).send(response)
	} catch (error) {
		res.status(500).send(error)
	}
})

router.get('/not-compensated-by-bank', auth, async (req, res, next) => {
	global.userId = res.locals.authData.userId
	try {
		const response = await controller.transactionController.transactionNotCompensatedByBank()
		res.status(response.code).send(response)
	} catch (error) {
		console.log(error)
		res.status(500).send(error)
	}
})

router.get('/not-compensated-credit', auth, async (req, res, next) => {
	global.userId = res.locals.authData.userId
	try {
		const response = await controller.transactionController.transactionNotCompensatedCredit()
		res.status(response.code).send(response)
	} catch (error) {
		console.log(error)
		res.status(500).send(error)
	}
})

router.get('/future-balance', auth, async (req, res, next) => {
	global.userId = res.locals.authData.userId
	try {
		const response = await controller.transactionController.futureTransactionBalance()
		res.status(response.code).send(response)
	} catch (error) {
		console.log(error)
		res.status(500).send(error)
	}
})

router.get('/not-compensated-debit', auth, async (req, res, next) => {
	global.userId = res.locals.authData.userId
	try {
		const response = await controller.transactionController.transactionNotCompensatedDebit()
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
		if (isEmpty(req.body)) {
			response = utils.makeResponse(204, 'Sem informação no corpo')
		} else {
			response = await controller.transactionController.planToPrincipal(
				req.body
			)
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
		const response = await controller.transactionController.getTransaction(
			idTransaction
		)
		res.status(response.code).send(response)
	} catch (error) {
		res.status(500).send(error)
	}
})

module.exports = router
