const AmountHistory = require('../model/amountHistory')
const utils = require('../utils')
const balancesController = require('./balancesController')
const userController = require('./userController')

exports.createAmountHistory = async (
	userId,
	dashboardData,
	actualBalance,
	netBalance
) => {
	try {
		const latestAmountHistory = await this.getLatestAmountHistory(userId)

		if (isOlderThanYesterday(latestAmountHistory.data)) {
			const newAmountHistory = new AmountHistory({
				userId,
				createdAt: new Date(),
				forecastIncoming: dashboardData.balanceNotCompensatedCredit,
				forecastOutgoing: dashboardData.balanceNotCompensatedDebit,
				actualBalance: actualBalance,
				netBalance: netBalance,
			})

			await newAmountHistory.save()
		}

		return utils.makeResponse(
			200,
			'Histórico de valores atualizado com sucesso.'
		)
	} catch (error) {
		console.error('Erro ao atualizar AmountHistory:', error)
		return utils.makeResponse(
			500,
			'Erro interno do servidor ao atualizar histórico.'
		)
	}
}

exports.updateAmountHistory = async (userId) => {
	try {
		const detalhesSaldosResponse = await balancesController.getDetalhesSaldos(
			userId
		)

		if (detalhesSaldosResponse.code !== 200) {
			return utils.makeResponse(
				500,
				'Erro ao obter os detalhes dos saldos para atualizar AmountHistory.'
			)
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

			if (!isOlderThanYesterday(latestAmountHistory)) {
				await AmountHistory.deleteOne({ _id: latestAmountHistory._id })
			}
		}

		const newAmountHistory = new AmountHistory({
			userId,
			createdAt: new Date(),
			forecastIncoming: balanceNotCompensatedCredit,
			forecastOutgoing: balanceNotCompensatedDebit,
			actualBalance: actualBalance,
			netBalance: netBalance,
		})

		await newAmountHistory.save()

		logger.info(
			`Histórico de valores atualizado com sucesso para o usuário ${userId}.`
		)
		return utils.makeResponse(
			200,
			'Histórico de valores atualizado com sucesso.'
		)
	} catch (error) {
		console.error('Erro ao atualizar AmountHistory:', error)
		return utils.makeResponse(
			500,
			'Erro interno do servidor ao atualizar histórico.'
		)
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

		return utils.makeResponse(
			200,
			'Registro encontrado com sucesso.',
			latestRecord
		)
	} catch (error) {
		console.error('Erro ao obter o registro mais recente:', error)
		return utils.makeResponse(500, 'Erro interno do servidor.')
	}
}

exports.getAmountHistoryList = async (userId, year, month) => {
	try {
		if (!userId) {
			return utils.makeResponse(400, 'O campo userId é obrigatório.')
		}

		const query = { userId }

		let records
		if (year !== 'all') {
			const firstMonth = '01'
			const lastMonth = '12'
			const startOfYear = new Date(`${year}-${firstMonth}-01T00:00:00.000Z`)
			const endOfYear = new Date(`${year}-${lastMonth}-31T23:59:59.999Z`)

			if (isNaN(startOfYear.getTime()) || isNaN(endOfYear.getTime())) {
				return utils.makeResponse(400, 'Ano inválido fornecido.')
			}

			query.createdAt = { $gte: startOfYear, $lte: endOfYear }

			if (month !== 'all') {
				const startOfMonth = new Date(
					`${year}-${month.padStart(2, '0')}-01T00:00:00.000Z`
				)
				const endOfMonth = new Date(
					new Date(startOfMonth).setMonth(startOfMonth.getMonth() + 1) - 1
				)

				if (isNaN(startOfMonth.getTime()) || isNaN(endOfMonth.getTime())) {
					return utils.makeResponse(400, 'Mês inválido fornecido.')
				}

				query.createdAt = {
					...(query.createdAt || {}),
					$gte: startOfMonth,
					$lte: endOfMonth,
				}

				records = await AmountHistory.find(query).sort({ createdAt: 1 }).exec()
			} else {
				// Trazer o registro mais recente de cada mês
				records = await AmountHistory.aggregate([
					{ $match: query },
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
			// Trazer o registro mais recente de cada ano
			records = await AmountHistory.aggregate([
				{ $match: query },
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
			return utils.makeResponse(
				404,
				'Nenhum registro encontrado para este usuário.'
			)
		}

		return utils.makeResponse(
			200,
			'Registros encontrados com sucesso.',
			records
		)
	} catch (error) {
		console.error('Erro ao obter a lista de registros:', error)
		return utils.makeResponse(500, 'Erro interno do servidor.')
	}
}

exports.updateAllHistories = async () => {
	try {
		logger.info(`Iniciando atualização de todos os históricos...`)
		const usersResponse = await userController.getListUsers()
		if (usersResponse.code !== 200) {
			logger.error(
				`Erro ao obter a lista de usuários: ${usersResponse.message}`
			)
			return utils.makeResponse(200, 'Done!')
		}

		const users = usersResponse.data
		await Promise.all(
			users.map(async (user) => {
				const userId = user._id.toString()
				return this.updateAmountHistory(userId)
			})
		)
		logger.info(`Históricos atualizados com sucesso para todos os usuários.`)
		return utils.makeResponse(200, 'Done!')
	} catch (error) {
		logger.error(`Erro ao atualizar todos os históricos: ${error.message}`)
		return utils.makeResponse(200, 'Done!')
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
