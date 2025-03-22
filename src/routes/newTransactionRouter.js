const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')
const bankController = require('../controllers/bankController')
const transactionController = require('../controllers/transactionController')
const descriptionController = require('../controllers/descriptionController')

router.get(
	'/load/:transactionType/:transactionId?',
	auth,
	async (req, res, next) => {
		try {
			const userId = res.locals.authData.userId

			const { transactionType, transactionId } = req.params

			const dashboardDataPromise = [
				bankController.getListBanks(userId, transactionType),
				descriptionController.getDescriptions(userId),
			]

			if (transactionId) {
				dashboardDataPromise.push(
					transactionController.getTransaction(userId, transactionId)
				)
			}

			const transactionData = await Promise.all(dashboardDataPromise)
			validateResponses(transactionData)

			const response = {
				banksList: transactionData[0].data,
				lastDescriptions: transactionData[1],
			}

			if (transactionId) {
				Object.assign(response, { transactionData: transactionData[2].data })
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
