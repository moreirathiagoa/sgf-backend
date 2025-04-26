const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')
const amountHistoryController = require('../controllers/amountHistoryController')

router.post('/', async (req, res) => {
	try {
		//const response = await amountHistoryController.createAmountHistory(req.body)
		//res.status(response.code).json(response)
		res.status(200).json({
			code: 200,
			message: 'Rota em desenvolvimento',
		})
	} catch (error) {
		res.status(500).json({ message: 'Erro interno do servidor.', error })
	}
})

router.get('/latest', auth, async (req, res) => {
	try {
		const userId = res.locals.authData.userId

		const response = await amountHistoryController.getLatestAmountHistory(
			userId
		)
		res.status(response.code).json(response)
	} catch (error) {
		res.status(500).json({ message: 'Erro interno do servidor.', error })
	}
})

router.get('/list', auth, async (req, res) => {
	try {
		const userId = res.locals.authData.userId

		const response = await amountHistoryController.getAmountHistoryList(userId)
		res.status(response.code).json(response)
	} catch (error) {
		res.status(500).json({ message: 'Erro interno do servidor.', error })
	}
})

module.exports = router
