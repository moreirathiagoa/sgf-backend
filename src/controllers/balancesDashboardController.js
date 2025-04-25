const controllerBank = require('./bankController')
const transactionController = require('./transactionController')
const utils = require('../utils')
const AmountHistory = require('../model/amountHistory')
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

		await checkAndCreateAmountHistory(
			userId,
			dashboardData,
			actualBalance,
			netBalance
		)

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

async function checkAndCreateAmountHistory(
	userId,
	dashboardData,
	actualBalance,
	netBalance
) {
	const latestAmountHistory = await AmountHistory.findOne({ userId }).sort({
		createdAt: -1,
	})

	if (
		isOlderThanYesterday(latestAmountHistory) &&
		hasDifferences(
			latestAmountHistory,
			dashboardData,
			actualBalance,
			netBalance
		)
	) {
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
	const yesterday = new Date(today)
	yesterday.setDate(today.getDate() - 1)

	return (
		!latestAmountHistory ||
		latestAmountHistory.createdAt.getTime() < yesterday.getTime()
	)
}

function hasDifferences(
	latestAmountHistory,
	dashboardData,
	actualBalance,
	netBalance
) {
	return (
		!latestAmountHistory ||
		latestAmountHistory.actualBalance !== actualBalance ||
		latestAmountHistory.netBalance !== netBalance ||
		latestAmountHistory.forecastIncoming !==
			dashboardData.balanceNotCompensatedCredit ||
		latestAmountHistory.forecastOutgoing !==
			dashboardData.balanceNotCompensatedDebit
	)
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
