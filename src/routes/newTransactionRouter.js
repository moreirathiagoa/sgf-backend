const express = require('express')
const controller = require('../controllers')
const router = express.Router()
const auth = require('../middlewares/auth')

router.get(
	'/load/:transactionType/:idTransaction?',
	auth,
	async (req, res, next) => {
		try {
			global.userId = res.locals.authData.userId

			const { transactionType, idTransaction } = req.params

			let dashboardDataPromise = [
				controller.bank.getListBanks(transactionType),
				controller.category.getListCategory(),
			]

			if (idTransaction) {
				dashboardDataPromise.push(
					controller.transaction.getTransaction(idTransaction)
				)
			}

			const dashboardData = await Promise.all(dashboardDataPromise)

			validateResponses(dashboardData)

			const response = {
				banksList: dashboardData[0].data,
				categoryList: dashboardData[1].data,
			}

			if (idTransaction)
				Object.assign(response, { transactionData: dashboardData[2].data })

			res.status(200).json(response)
		} catch (error) {
			res.status(500).json(error.message)
		}
	}
)

function validateResponses(dashboardData) {
	const responseCodes = dashboardData.map((el) => el.code)
	const hasResponseWithError = responseCodes.find((el) => el != 200)
	if (hasResponseWithError) {
		throw new Error('Não foi possível obter os dados do dashboard')
	}
}

module.exports = router
