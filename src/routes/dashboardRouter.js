const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')
const dashboardController = require('../controllers/dashboardController')

router.get('/latest', auth, async (req, res) => {
	try {
		const userId = res.locals.authData.userId

		const response = await dashboardController.getLatestAmountHistory(userId)
		res.status(response.code).json(response)
	} catch (error) {
		res.status(500).json({ message: 'Erro interno do servidor.', error })
	}
})

router.get('/list', auth, async (req, res) => {
	try {
		const userId = res.locals.authData.userId

		const response = await dashboardController.getAmountHistoryList(userId)
		res.status(response.code).json(response)
	} catch (error) {
		res.status(500).json({ message: 'Erro interno do servidor.', error })
	}
})

router.put('/update', auth, async (req, res) => {
	try {
		const userId = res.locals.authData.userId

		const response = await dashboardController.updateAmountHistory(userId)
		res.status(response.code).json(response)
	} catch (error) {
		res.status(500).json({ message: 'Erro interno do servidor.', error })
	}
})

router.post('/create', auth, async (req, res) => {
	try {
		const userId = res.locals.authData.userId
		const { dashboardData, actualBalance, netBalance } = req.body

		const response = await dashboardController.createAmountHistory(
			userId,
			dashboardData,
			actualBalance,
			netBalance
		)
		res.status(response.code).json(response)
	} catch (error) {
		res.status(500).json({ message: 'Erro interno do servidor.', error })
	}
})

module.exports = router
