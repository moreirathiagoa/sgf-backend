const express = require('express')
const controller = require('../controllers')
const router = express.Router()
const auth = require('../middlewares/auth')

router.get('/get-planing-balance', auth, async (req, res, next) => {
	try {
		global.userId = res.locals.authData.userId

		const dashboardDataPromise = [
			controller.bank.getListBanksDashboard(),
			controller.transaction.futureTransactionBalance(),
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
