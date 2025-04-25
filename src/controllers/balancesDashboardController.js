const controllerBank = require('./bankController')
const transactionController = require('./transactionController')
const utils = require('../utils')
const amountHistoryController = require('./amountHistoryController')

exports.getDetalhesSaldos = async (userId) => {
	try {
		const dashboardData = await getDashboardData(userId)
		const banks = dashboardData.banksList.filter((bank) => bank.isActive)

		let netBalance = 0
		let actualBalance = 0

		banks.forEach((bank) => {
			netBalance += bank.saldoSistema

			if (bank.bankType === 'Conta Corrente') {
				actualBalance += bank.saldoSistemaDeduzido
			}
		})

		netBalance = parseFloat(netBalance.toFixed(2))

		await updateAmountHistory(userId, dashboardData, actualBalance, netBalance)

		return utils.makeResponse(200, 'Detalhes dos saldos obtidos com sucesso', {
			banks,
			saldoReal: actualBalance,
			saldoLiquido: netBalance,
			balanceNotCompensatedCredit: dashboardData.balanceNotCompensatedCredit,
			balanceNotCompensatedDebit: dashboardData.balanceNotCompensatedDebit,
		})
	} catch (error) {
		return utils.makeResponse(
			500,
			`Erro ao obter os detalhes dos saldos: ${error.message}`
		)
	}
}

function validateResponses(dashboardData) {
	const responseCodes = dashboardData.map((el) => el.code)
	const hasResponseWithError = responseCodes.find((el) => el != 200)
	if (hasResponseWithError) {
		throw new Error('Não foi possível obter os dados do dashboard')
	}
}

async function updateAmountHistory(
	userId,
	dashboardData,
	actualBalance,
	netBalance
) {
	const latestAmountHistory =
		await amountHistoryController.getLatestAmountHistory(userId)

	if (isOlderThanYesterday(latestAmountHistory.data)) {
		await amountHistoryController.createAmountHistory({
			userId,
			createdAt: new Date(),
			forecastIncoming: dashboardData.balanceNotCompensatedCredit,
			forecastOutgoing: dashboardData.balanceNotCompensatedDebit,
			actualBalance: actualBalance,
			netBalance: netBalance,
		})
	}
}

function isOlderThanYesterday(latestAmountHistory) {
	const today = new Date()
	today.setHours(12, 0, 0, 0)

	if (!latestAmountHistory) {
		return true
	}

	const lastRegister = new Date(latestAmountHistory.createdAt)
	lastRegister.setHours(12, 0, 0, 0)

	return lastRegister.getTime() < today.getTime()
}

async function getDashboardData(userId) {
	const dashboardDataPromise = [
		controllerBank.getListBanksDashboard(userId),
		transactionController.transactionNotCompensatedCredit(userId),
		transactionController.transactionNotCompensatedDebit(userId),
	]

	const dashboardData = await Promise.all(dashboardDataPromise)
	validateResponses(dashboardData)

	return {
		banksList: dashboardData[0].data,
		balanceNotCompensatedCredit: dashboardData[1].data,
		balanceNotCompensatedDebit: dashboardData[2].data,
	}
}
