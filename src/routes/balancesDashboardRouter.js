const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')
const controllerBank = require('../controllers/bankController')
const transactionController = require('../controllers/transactionController')

router.get('/get-balances', auth, async (req, res, next) => {
	try {
		const userId = res.locals.authData.userId

		const dashboardDataPromise = [
			controllerBank.getListBanksDashboard(userId),
			transactionController.transactionNotCompensatedCredit(userId),
			transactionController.transactionNotCompensatedDebit(userId),
		]

		const dashboardData = await Promise.all(dashboardDataPromise)
		validateResponses(dashboardData)

		const response = {
			banksList: dashboardData[0].data,
			balanceNotCompensatedCredit: dashboardData[1].data,
			balanceNotCompensatedDebit: dashboardData[2].data,
		}

		res.status(200).json(response)
	} catch (error) {
		res.status(500).json(error.message)
	}
})

function validateResponses(dashboardData) {
	const responseCodes = dashboardData.map((el) => el.code)
	const hasResponseWithError = responseCodes.find((el) => el != 200)
	if (hasResponseWithError) {
		throw new Error('Não foi possível obter os dados do dashboard')
	}
}

module.exports = router
