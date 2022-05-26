const express = require('express')
const controller = require('../controllers')
const router = express.Router()
const auth = require('../middlewares/auth')

router.get('/get-balances', auth, async (req, res, next) => {
	try {
		global.userId = res.locals.authData.userId

		const dashboardDataPromise = [
			controller.bank.getListBanksDashboard(),
			controller.category.getListCategory(),
			controller.transaction.transactionNotCompensatedCredit(),
			controller.transaction.transactionNotCompensatedDebit(),
		]

		const dashboardData = await Promise.all(dashboardDataPromise)

		validateResponses(dashboardData)

		const response = {
			banksList: dashboardData[0].data,
			categoryList: dashboardData[1].data,
			balanceNotCompensatedCredit: dashboardData[2].data,
			balanceNotCompensatedDebit: dashboardData[3].data,
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
