const AmountHistory = require('../model/amountHistory')
const utils = require('../utils')

exports.createAmountHistory = async (data) => {
	try {
		const {
			userId,
			createdAt,
			forecastIncoming,
			forecastOutgoing,
			actualBalance,
			netBalance,
		} = data

		// Validação básica
		if (
			!userId ||
			!createdAt ||
			forecastIncoming == null ||
			forecastOutgoing == null ||
			actualBalance == null ||
			netBalance == null
		) {
			return utils.makeResponse(400, 'Todos os campos são obrigatórios.')
		}

		// Criação do novo registro
		const newAmountHistory = new AmountHistory({
			userId,
			createdAt,
			forecastIncoming,
			forecastOutgoing,
			actualBalance,
			netBalance,
		})

		// Salvando no banco de dados
		await newAmountHistory.save()

		// Retornando o registro criado
		return utils.makeResponse(
			201,
			'Registro criado com sucesso.',
			newAmountHistory
		)
	} catch (error) {
		console.error('Erro ao criar AmountHistory:', error)
		return utils.makeResponse(500, 'Erro interno do servidor.')
	}
}

exports.getLatestAmountHistory = async (userId) => {
	try {
		// Validação básica
		if (!userId) {
			return utils.makeResponse(400, 'O campo userId é obrigatório.')
		}

		// Obtendo o registro mais recente
		const latestRecord = await AmountHistory.findOne({ userId })
			.sort({ createdAt: -1 }) // Ordena por createdAt em ordem decrescente
			.exec()

		// Verificando se o registro foi encontrado
		if (!latestRecord) {
			return utils.makeResponse(404, 'Nenhum registro encontrado para este usuário.')
		}

		// Retornando o registro encontrado
		return utils.makeResponse(200, 'Registro encontrado com sucesso.', latestRecord)
	} catch (error) {
		console.error('Erro ao obter o registro mais recente:', error)
		return utils.makeResponse(500, 'Erro interno do servidor.')
	}
}

exports.getAmountHistoryList = async (userId) => {
	try {
		// Validação básica
		if (!userId) {
			return utils.makeResponse(400, 'O campo userId é obrigatório.')
		}

		// Obtendo a lista de registros
		const records = await AmountHistory.find({ userId })
			.sort({ createdAt: -1 }) // Ordena por createdAt em ordem decrescente
			.exec()

		// Verificando se registros foram encontrados
		if (!records || records.length === 0) {
			return utils.makeResponse(404, 'Nenhum registro encontrado para este usuário.')
		}

		// Retornando a lista de registros
		return utils.makeResponse(200, 'Registros encontrados com sucesso.', records)
	} catch (error) {
		console.error('Erro ao obter a lista de registros:', error)
		return utils.makeResponse(500, 'Erro interno do servidor.')
	}
}
