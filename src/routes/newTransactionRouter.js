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
				controller.description.getDescriptions(),
			]

			if (idTransaction) {
				dashboardDataPromise.push(
					controller.transaction.getTransaction(idTransaction)
				)
			}

			const transactionData = await Promise.all(dashboardDataPromise)

			validateResponses(transactionData)

			const response = {
				banksList: transactionData[0].data,
				categoryList: transactionData[1].data,
				lastDescriptions: transactionData[2],
			}

			if (idTransaction) {
				Object.assign(response, { transactionData: transactionData[3].data })
			}

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
