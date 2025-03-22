const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')
const bankController = require('../controllers/bankController')
const transactionController = require('../controllers/transactionController')

router.get('/get-planing-balance', auth, async (req, res, next) => {
	try {
		const userId = res.locals.authData.userId

		const dashboardDataPromise = [
			bankController.getListBanksDashboard(userId),
			transactionController.futureTransactionBalance(userId),
		]

		const planningData = await Promise.all(dashboardDataPromise)

		validateResponses(planningData)

		const response = {
			banksList: planningData[0].data,
			futureTransactionBalance: planningData[1].data,
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
