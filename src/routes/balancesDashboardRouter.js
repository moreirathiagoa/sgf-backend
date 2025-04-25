const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')
const balancesDashboardController = require('../controllers/balancesDashboardController')

router.get('/get-balances', auth, async (req, res, next) => {
	try {
		const userId = res.locals.authData.userId
		const response = await balancesDashboardController.getDetalhesSaldos(userId)
		res.status(200).json(response)
	} catch (error) {
		res.status(500).json(error.message)
	}
})

module.exports = router
