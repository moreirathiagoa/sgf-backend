const { isEmpty } = require('lodash')
const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')
const bankController = require('../controllers/bankController')

router.get('/list/:transactionType', auth, async (req, res, next) => {
	try {
		const userId = res.locals.authData.userId
		const { transactionType } = req.params
		const response = await bankController.getListBanks(userId, transactionType)
		res.status(response.code).json(response)
	} catch (error) {
		res.status(500).json(error)
	}
})

router.get('/:idBank', auth, async (req, res, next) => {
	try {
		const userId = res.locals.authData.userId
		const { idBank } = req.params
		const response = await bankController.getBank(userId, idBank)
		res.status(response.code).json(response)
	} catch (error) {
		res.status(500).json(error)
	}
})

router.post('/create', auth, async (req, res, next) => {
	try {
		const userId = res.locals.authData.userId

		let response
		if (isEmpty(req.body)) {
			response = utils.makeResponse(204, 'Sem informação no corpo')
		} else {
			response = await bankController.createBank(userId, req.body)
		}

		res.status(response.code).json(response)
	} catch (error) {
		res.status(500).json(error)
	}
})

router.put('/update/:idBank', auth, async (req, res, next) => {
	try {
		const userId = res.locals.authData.userId
		const { idBank } = req.params

		let response
		if (isEmpty(req.body)) {
			response = utils.makeResponse(204, 'Sem informação no corpo')
		} else {
			response = await bankController.updateBank(userId, idBank, req.body)
		}
		res.status(response.code).json(response)
	} catch (error) {
		res.status(500).json(error)
	}
})

router.delete('/delete/:idBank', auth, async (req, res, next) => {
	try {
		const userId = res.locals.authData.userId
		const { idBank } = req.params
		const response = await bankController.deleteBank(userId, idBank)

		res.status(response.code).json(response)
	} catch (error) {
		res.status(500).json(error)
	}
})

module.exports = router
