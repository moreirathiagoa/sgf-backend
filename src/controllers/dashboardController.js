const AmountHistory = require('../model/amountHistory')
const utils = require('../utils')
const balancesController = require('./balancesController')
const userController = require('./userController')

function newDateBr() {
//const today = new Date('2025-05-02T12:00:00.000Z')
	const today = new Date()
	today.setHours(today.getHours() - 3)
	return today
}

exports.createAmountHistory = async (
	userId,
	dashboardData,
	actualBalance,
	netBalance
) => {
	try {
		if (!userId) {
			return utils.makeResponse(400, 'O campo userId é obrigatório.')
		}

		const latestAmountHistoryResponse = await this.getLatestAmountHistory(
			userId
		)
		if (latestAmountHistoryResponse.code === 200) {
			const latestAmountHistory = latestAmountHistoryResponse.data
			if (!wasRegisteredToday(latestAmountHistory)) {
				return utils.makeResponse(200, 'Histórico já atualizado.')
			}
		}

		const newAmountHistory = new AmountHistory({
			userId,
			createdAt: newDateBr(),
			forecastIncoming: dashboardData.balanceNotCompensatedCredit,
			forecastOutgoing: dashboardData.balanceNotCompensatedDebit,
			actualBalance,
			netBalance,
		})

		await newAmountHistory.save()

		return utils.makeResponse(201, 'Histórico de valores criado com sucesso.')
	} catch (error) {
		logger.error(`Erro ao criar AmountHistory: ${error.message}`)
		return utils.makeResponse(500, 'Erro interno do servidor.')
	}
}

exports.updateAmountHistory = async (userId) => {
	try {
		if (!userId) {
			return utils.makeResponse(400, 'O campo userId é obrigatório.')
		}

		const detalhesSaldosResponse = await balancesController.getDetalhesSaldos(
			userId
		)
		if (detalhesSaldosResponse.code !== 200) {
			return utils.makeResponse(502, 'Erro ao obter detalhes dos saldos.')
		}

		const {
			saldoReal: actualBalance,
			saldoLiquido: netBalance,
			balanceNotCompensatedCredit,
			balanceNotCompensatedDebit,
		} = detalhesSaldosResponse.data

		const latestAmountHistoryResponse = await this.getLatestAmountHistory(
			userId
		)
		if (latestAmountHistoryResponse.code === 200) {
			const latestAmountHistory = latestAmountHistoryResponse.data
			if (wasRegisteredToday(latestAmountHistory)) {
				await AmountHistory.deleteOne({ _id: latestAmountHistory._id })
			}
		}

		const newAmountHistory = new AmountHistory({
			userId,
			createdAt: newDateBr(),
			forecastIncoming: balanceNotCompensatedCredit,
			forecastOutgoing: balanceNotCompensatedDebit,
			actualBalance,
			netBalance,
		})

		await newAmountHistory.save()

		logger.info(`Histórico de valores atualizado para usuário ${userId}`)
		return utils.makeResponse(
			200,
			'Histórico de valores atualizado com sucesso.'
		)
	} catch (error) {
		logger.error(`Erro ao atualizar AmountHistory: ${error.message}`)
		return utils.makeResponse(500, 'Erro interno do servidor.')
	}
}

exports.getLatestAmountHistory = async (userId) => {
	try {
		if (!userId) {
			return utils.makeResponse(400, 'O campo userId é obrigatório.')
		}

		const latestRecord = await AmountHistory.findOne({ userId })
			.sort({ createdAt: -1 })
			.exec()

		if (!latestRecord) {
			return utils.makeResponse(
				404,
				'Nenhum registro encontrado para este usuário.'
			)
		}

		return utils.makeResponse(200, 'Registro encontrado.', latestRecord)
	} catch (error) {
		logger.error(`Erro ao buscar último AmountHistory: ${error.message}`)
		return utils.makeResponse(500, 'Erro interno do servidor.')
	}
}

exports.getAmountHistoryList = async (userId, year, month) => {
	try {
		if (!userId) {
			return utils.makeResponse(400, 'O campo userId é obrigatório.')
		}

		const query = { userId }
		let records = []

		if (year !== 'all') {
			const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`)
			const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`)

			if (isNaN(startOfYear) || isNaN(endOfYear)) {
				return utils.makeResponse(400, 'Ano inválido.')
			}

			query.createdAt = { $gte: startOfYear, $lte: endOfYear }

			if (month !== 'all') {
				const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0)
				const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999)

				if (isNaN(startOfMonth) || isNaN(endOfMonth)) {
					return utils.makeResponse(400, 'Mês inválido.')
				}

				const endOfPreviousMonth = new Date(startOfMonth - 1)
				const previousMonthRecord = await AmountHistory.findOne({
					userId,
					createdAt: { $lte: endOfPreviousMonth },
				})
					.sort({ createdAt: -1 })
					.exec()

				query.createdAt = { $gte: startOfMonth, $lte: endOfMonth }
				const currentMonthRecords = await AmountHistory.find(query)
					.sort({ createdAt: 1 })
					.exec()

				if (currentMonthRecords.length > 0) {
					records = currentMonthRecords
				}

				if (previousMonthRecord) {
					records.unshift(previousMonthRecord)
				}
			} else {
				records = await AmountHistory.aggregate([
					{ $match: query },
					{ $sort: { createdAt: 1 } },
					{
						$group: {
							_id: { month: { $month: '$createdAt' } },
							latestRecord: { $last: '$$ROOT' },
						},
					},
					{ $replaceRoot: { newRoot: '$latestRecord' } },
					{ $sort: { createdAt: 1 } },
				])
			}
		} else {
			records = await AmountHistory.aggregate([
				{ $match: query },
				{ $sort: { createdAt: 1 } },
				{
					$group: {
						_id: { year: { $year: '$createdAt' } },
						latestRecord: { $last: '$$ROOT' },
					},
				},
				{ $replaceRoot: { newRoot: '$latestRecord' } },
				{ $sort: { createdAt: 1 } },
			])
		}

		if (!records || records.length === 0) {
			return utils.makeResponse(404, 'Nenhum registro encontrado.')
		}

		return utils.makeResponse(200, 'Registros encontrados.', records)
	} catch (error) {
		logger.error(`Erro ao listar AmountHistory: ${error.message}`)
		return utils.makeResponse(500, 'Erro interno do servidor.')
	}
}

exports.updateAllHistories = async () => {
	try {
		logger.info(`Iniciando atualização de todos os históricos...`)
		const usersResponse = await userController.getListUsers()

		if (usersResponse.code !== 200) {
			logger.error(`Erro ao buscar usuários: ${usersResponse.message}`)
			return utils.makeResponse(200, 'Done!!')
		}

		const users = usersResponse.data
		await Promise.all(
			users.map((user) => this.updateAmountHistory(user._id.toString()))
		)

		logger.info(`Históricos atualizados com sucesso para todos os usuários.`)
		return utils.makeResponse(200, 'Done!!')
	} catch (error) {
		logger.error(`Erro ao atualizar todos AmountHistories: ${error.message}`)
		return utils.makeResponse(200, 'Done!!')
	}
}

function wasRegisteredToday(latestAmountHistory) {
	if (!latestAmountHistory) return false

	const today = newDateBr()
	const registerDate = new Date(latestAmountHistory.createdAt)
	const todayDate = new Date(today.toISOString().split('T')[0])
	const registerDateDate = new Date(registerDate.toISOString().split('T')[0])

	return registerDateDate.getTime() >= todayDate.getTime()
}
