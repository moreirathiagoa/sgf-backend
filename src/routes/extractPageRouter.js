const { get } = require('lodash')
const express = require('express')
const controller = require('../controllers')
const router = express.Router()
const auth = require('../middlewares/auth')

router.post(
	'/get-extract-data/:transactionType',
	auth,
	async (req, res, next) => {
		try {
			global.userId = res.locals.authData.userId
			const { transactionType } = req.params
			const filters = get(req, 'body.filters', null)

			const extractDataPromise = [
				controller.bank.getListBanks(transactionType, { isActive: true }),
				controller.transaction.getListTransaction(transactionType, filters),
			]

			const extractData = await Promise.all(extractDataPromise)

			validateResponses(extractData)

			const response = {
				banksList: extractData[0].data,
				transactionList: extractData[1].data,
			}

			res.status(200).json(response)
		} catch (error) {
			res.status(500).json(error.message)
		}
	}
)

function validateResponses(dashboardData) {
	const responseCodes = dashboardData.map((el) => el.code)
	const hasResponseWithError = responseCodes.find(
		(el) => ![200, 203].includes(el)
	)
	if (hasResponseWithError) {
		throw new Error('Não foi possível obter os dados do dashboard')
	}
}

module.exports = router
