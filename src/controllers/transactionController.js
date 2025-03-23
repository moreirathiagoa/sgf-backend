const { round, isEmpty } = require('lodash')
const utils = require('../utils')
const db = require('../database')
const descriptionController = require('./descriptionController')
const bankController = require('./bankController')
const transactionModel = require('../model/transactionModel')

exports.getListTransaction = async (userId, transactionType, filters) => {
	try {
		const params = { transactionType: transactionType, userId: userId }
		if (filters) {
			const factoredFilters = prepareFilters(filters)

			Object.assign(params, factoredFilters)
		}

		const transactionFind = await db
			.find(transactionModel, params)
			.sort({ effectedAt: -1 })
			.populate('bankId', 'name')

		if (isEmpty(transactionFind))
			return utils.makeResponse(203, 'Transação não encontradas', [])

		return utils.makeResponse(200, 'Lista de Transações', transactionFind)
	} catch (error) {
		logger.error(`Erro ao obter a lista de bancos - ${error.message || error}`)
		throw error
	}
}

exports.getTransaction = async (userId, transactionId) => {
	try {
		const params = { _id: transactionId, userId: userId }
		const transactionFind = await db.findOne(transactionModel, params)
		if (isEmpty(transactionFind))
			return utils.makeResponse(203, 'Transação não encontradas', [])

		return utils.makeResponse(200, 'Transação encontrada', transactionFind)
	} catch (error) {
		logger.error(`Erro ao obter a lista de bancos - ${error.message || error}`)
		throw error
	}
}

exports.bankTransference = async (userId, data) => {
	const { originalBankId, finalBankId, value } = data

	const { data: originBankFind } = await bankController.getBank(
		userId,
		originalBankId
	)

	if (isEmpty(originBankFind))
		return utils.makeResponse(203, 'Banco de origem não encontrado')

	const { data: finalBankFind } = await bankController.getBank(
		userId,
		finalBankId
	)

	if (isEmpty(finalBankFind))
		return utils.makeResponse(203, 'Banco destino não encontrado')

	const debitTransaction = {
		effectedAt: new Date(),
		bankId: originalBankId,
		//TODO: Quando adicionar a ordenação de banco, remover o replace
		bankName: originBankFind.name.replace(/^[\w\d]+\. /, ''),
		isSimples: false,
		value: -1 * value,
		isCompensated: true,
		transactionType: 'contaCorrente',
		description: 'Transferência Interna',
		detail: `Para: ${finalBankFind.name}`,
	}

	const creditTransaction = {
		effectedAt: new Date(),
		bankId: finalBankId,
		//TODO: Quando adicionar a ordenação de banco, remover o replace
		bankName: finalBankFind.name.replace(/^[\w\d]+\. /, ''),
		isSimples: false,
		value: value,
		isCompensated: true,
		transactionType: 'contaCorrente',
		description: 'Transferência Interna',
		detail: `De: ${originBankFind.name}`,
	}
	try {
		await createTransaction(userId, debitTransaction)
			.then((res) => {
				if (res.code == 201) {
					return createTransaction(userId, creditTransaction)
				} else {
					throw new Erro('Erro no cadastro da primeira transação.')
				}
			})
			.then((res) => {
				if (res.code != 201) {
					throw new Erro('Erro no cadastro da segunda transação.')
				}
			})
			.catch((err) => {
				console.log('err: ', err)
				throw err
			})
		return utils.makeResponse(201, 'Transferência efetuada com sucesso', {})
	} catch (error) {
		return utils.makeResponse(
			203,
			'A transferência não pode ser efetuada. Verifique no extrato se uma das transações foi efetuada.',
			{}
		)
	}
}

exports.createTransaction = async (userId, transactionToCreate) => {
	try {
		const validation = await validadeTransactionOnCreate(
			userId,
			transactionToCreate
		)
		if (validation) return utils.makeResponse(203, validation)

		transactionToCreate.effectedAt = utils.formatDateToBataBase(
			transactionToCreate.effectedAt
		)

		transactionToCreate.userId = userId
		transactionToCreate.createdAt = utils.actualDateToBataBase()

		let totalTransaction = 1
		if (transactionToCreate.finalRecurrence) {
			totalTransaction = transactionToCreate.finalRecurrence

			if (transactionToCreate.isSimples) {
				delete transactionToCreate.finalRecurrence
			} else {
				if (transactionToCreate.finalRecurrence == 1) {
					delete transactionToCreate.finalRecurrence
				} else {
					transactionToCreate.currentRecurrence = 1
				}
			}
		}

		const { data: bankFind } = await bankController.getBank(
			userId,
			transactionToCreate.bankId
		)

		//TODO: Quando adicionar a ordenação de banco, remover o replace
		transactionToCreate.bankName = bankFind.name.replace(/^[\w\d]+\. /, '')

		if (transactionToCreate.transactionType === 'planejamento') {
			transactionToCreate.isCompensated = false
		}

		let response = []
		for (let i = 0; i < totalTransaction; i++) {
			if (i > 0) {
				if (!transactionToCreate.isSimples) {
					transactionToCreate.currentRecurrence++
				}

				if (
					transactionToCreate.transactionType === 'contaCorrente' ||
					transactionToCreate.transactionType === 'planejamento'
				) {
					const nextDate = utils.addMonth(transactionToCreate.effectedAt, 1)
					transactionToCreate.effectedAt = utils.formatDateToBataBase(nextDate)
				}
			}
			const transactionToSave = new transactionModel(transactionToCreate)
			const transactionSaved = await db.save(transactionToSave)

			//TODO: implementar transaction para rollback quando erro ao atualizar saldo
			await descriptionController.createDescription(
				userId,
				transactionToCreate.description
			)

			if (transactionToCreate.transactionType === 'contaCorrente') {
				await updateSaldoContaCorrente(
					userId,
					bankFind._id,
					transactionSaved.value
				)
			}

			response.push(transactionSaved)
		}

		if (response.length == 0)
			return utils.makeResponse(203, 'A transação não pode ser salva')

		return utils.makeResponse(201, 'Transação criada com sucesso', response)
	} catch (error) {
		logger.error(`Erro ao obter a lista de bancos - ${error.message || error}`)
		throw error
	}
}

exports.updateTransaction = async (userId, transactionId, newTransaction) => {
	try {
		const validation = await validateTransactionOnUpdate(newTransaction)
		if (validation) return utils.makeResponse(203, validation)

		const params = { _id: transactionId, userId: userId }
		const oldTransaction = await db.findOne(transactionModel, params)

		if (isEmpty(oldTransaction)) {
			return utils.makeResponse(203, 'Transação não encontrada')
		}

		const bankFind = await bankController.getBank(userId, newTransaction.bankId)

		if (bankFind.code !== 200 || !bankFind?.data?.isActive) {
			if (newTransaction.isCompensated !== oldTransaction.isCompensated) {
				return utils.makeResponse(
					203,
					'Não é possível ajustar status de compensação de banco inativo ou excluído'
				)
			}

			if (newTransaction.value !== oldTransaction.value) {
				return utils.makeResponse(
					203,
					'Não é possível ajustar o valor de banco inativo ou excluído'
				)
			}

			if (
				newTransaction.bankId.toString() !== oldTransaction.bankId.toString()
			) {
				return utils.makeResponse(
					203,
					'Não é possível ajustar o banco quando estiver inativo ou excluído'
				)
			}
		}

		if (bankFind.code === 200 && bankFind.data.isActive) {
			//TODO: Quando adicionar a ordenação de banco, remover o replace
			newTransaction.bankName = bankFind.data.name.replace(/^[\w\d]+\. /, '')
		}

		if (newTransaction.transactionType === 'planejamento') {
			newTransaction.isCompensated = false
		}

		newTransaction.effectedAt = utils.formatDateToBataBase(
			newTransaction.effectedAt
		)

		const finalTransaction = await transactionModel.findOneAndUpdate(
			params,
			newTransaction,
			{
				new: true,
			}
		)

		if (oldTransaction.description != newTransaction.description) {
			await descriptionController.createDescription(
				userId,
				newTransaction.description
			)
		}

		if (finalTransaction.transactionType === 'contaCorrente') {
			if (
				finalTransaction.bankId.toString() != oldTransaction.bankId.toString()
			) {
				await updateSaldoContaCorrente(
					userId,
					finalTransaction.bankId,
					finalTransaction.value
				)
				await updateSaldoContaCorrente(
					userId,
					oldTransaction.bankId,
					oldTransaction.value * -1
				)
			} else {
				const saldoAdjust = finalTransaction.value - oldTransaction.value
				await updateSaldoContaCorrente(
					userId,
					finalTransaction.bankId,
					saldoAdjust
				)
			}
		}

		return utils.makeResponse(
			202,
			'Transação atualizada com sucesso',
			finalTransaction
		)
	} catch (error) {
		throw error
	}
}

exports.deleteTransaction = async (userId, transactionId) => {
	try {
		const params = { _id: transactionId, userId: userId }
		const transactionFind = await db.findOne(transactionModel, params)
		if (isEmpty(transactionFind))
			return utils.makeResponse(203, 'Transação não encontrada')

		const transactionToDelete = new transactionModel(transactionFind)
		const response = await db.remove(transactionToDelete)

		const saldoAdjust = -1 * transactionToDelete.value

		switch (transactionToDelete.transactionType) {
			case 'contaCorrente':
				await updateSaldoContaCorrente(
					userId,
					transactionToDelete.bankId,
					saldoAdjust
				)
				break

			default:
		}

		return utils.makeResponse(202, 'Transação removida com sucesso', response)
	} catch (error) {
		logger.error(`Erro ao obter a lista de bancos - ${error.message || error}`)
		throw error
	}
}

exports.getNotCompensatedTransactionCount = async (userId, bankId) => {
	const params = { userId: userId, bankId: bankId, isCompensated: false }
	const transactionsCount = await db.find(transactionModel, params).count()
	console.log('transactionFind: ', transactionsCount)

	return utils.makeResponse(
		200,
		'Busca de transações não compensadas por banco efetuada com sucesso',
		{
			totalTransactionsNotCompensated: transactionsCount,
			hasNotCompensated: transactionsCount > 0,
		}
	)
}

exports.getUncompensatedTransactionsGroupedByBank = async (userId) => {
	const params = {
		userId: userId,
		transactionType: 'contaCorrente',
		isCompensated: false,
	}
	let response = await transactionModel.aggregate([
		{ $match: params },
		{
			$group: {
				_id: { bankId: '$bankId' },
				saldoNotCompensated: { $sum: '$value' },
			},
		},
	])

	let responseToSend = []
	response.forEach((el) => {
		el.bankId = el._id.bankId
		delete el._id
		responseToSend.push(el)
	})

	return utils.makeResponse(200, 'Saldo obtido com sucesso', responseToSend)
}

exports.transactionNotCompensatedDebit = async (userId) => {
	const params = {
		userId: userId,
		isCompensated: false,
		transactionType: 'contaCorrente',
		value: { $lte: 0 },
	}
	let response = await transactionModel.aggregate([
		{ $match: params },
		{ $group: { _id: null, saldoNotCompensated: { $sum: '$value' } } },
	])

	let responseToSend
	if (response.length === 0) {
		responseToSend = 0
	} else {
		responseToSend = response[0].saldoNotCompensated
	}

	return utils.makeResponse(200, 'Saldo obtido com sucesso', responseToSend)
}

exports.transactionNotCompensatedCredit = async (userId) => {
	const params = {
		userId: userId,
		isCompensated: false,
		transactionType: 'contaCorrente',
		value: { $gt: 0 },
	}
	let response = await transactionModel.aggregate([
		{ $match: params },
		{ $group: { _id: null, saldoNotCompensated: { $sum: '$value' } } },
	])
	let responseToSend
	if (response.length === 0) {
		responseToSend = 0
	} else {
		responseToSend = response[0].saldoNotCompensated
	}

	return utils.makeResponse(200, 'Saldo obtido com sucesso', responseToSend)
}

exports.planToPrincipal = async (userId, transactions) => {
	const transactionToUpdate = {
		isCompensated: false,
		transactionType: 'contaCorrente',
	}

	let response = []

	for (let transaction of transactions) {
		await updateSaldoContaCorrente(
			userId,
			transaction.bankId,
			transaction.value
		)

		const params = { _id: transaction._id }
		const transactionToReturn = await transactionModel.findByIdAndUpdate(
			params,
			transactionToUpdate,
			{ new: true }
		)
		response.push(transactionToReturn)
	}

	return utils.makeResponse(201, 'Transação atualizada com sucesso', response)
}

exports.futureTransactionBalance = async (userId) => {
	const transactionCredit = await getFutureTransactionCredit(userId)
	const transactionDebit = await getFutureTransactionDebit(userId)

	if (transactionDebit.length == 0 && transactionCredit.length == 0) {
		return utils.makeResponse(203, 'Não existem saldos para retorno')
	}

	const minDate = getMinData(transactionDebit, transactionCredit)
	const maxDate = getMaxData(transactionDebit, transactionCredit)

	let indexDate = minDate
	let responseToReturn = []
	while (indexDate <= maxDate) {
		const month = indexDate.getMonth() + 1
		const year = indexDate.getFullYear()

		let finalDebit = transactionDebit.find((t) => {
			return t._id.month == month && t._id.year == year
		})
		let finalCredit = transactionCredit.find((t) => {
			return t._id.month == month && t._id.year == year
		})

		const response = {
			month: month,
			year: year,
			debit: finalDebit ? finalDebit.debit : 0,
			credit: finalCredit ? finalCredit.credit : 0,
			card: 0,
		}

		responseToReturn.push(response)

		indexDate.setDate(indexDate.getDate() + 30)
	}

	return utils.makeResponse(200, 'Saldo obtido com sucesso', responseToReturn)
}

/* FUNÇÕES DE APOIO */

function prepareFilters(filters) {
	const { year, month, onlyFuture, bankId, description, detail } = filters

	let monthNumber = Number(month)
	let yearNumber = Number(year)
	const min = `${yearNumber}-${monthNumber}-01 00:00:00Z`
	if (monthNumber >= 12) {
		monthNumber = 0
		yearNumber++
	}
	const max = `${yearNumber}-${monthNumber + 1}-01 00:00:00Z`

	const minimalDate = new Date(min)
	const maximalDate = new Date(max)

	const response = {
		effectedAt: {
			$gte: minimalDate.toISOString(),
			$lt: maximalDate.toISOString(),
		},
	}

	if (onlyFuture) {
		Object.assign(response, { isCompensated: false })
	}

	if (bankId !== 'Selecione' && bankId) {
		Object.assign(response, { bankId: bankId })
	}

	if (description) {
		const sanitizedDescription = description
			.replace('(', '\\(')
			.replace(')', '\\)')

		Object.assign(response, {
			description: { $regex: sanitizedDescription, $options: 'i' },
		})
	}

	if (detail) {
		Object.assign(response, {
			detail: { $regex: detail, $options: 'i' },
		})
	}

	return response
}

async function getFutureTransactionCredit(userId) {
	const paramsCredit = {
		userId: userId,
		transactionType: 'planejamento',
		value: { $gt: 0 },
	}
	const transactionCredit = await transactionModel.aggregate([
		{ $match: paramsCredit },
		{
			$group: {
				_id: {
					month: { $month: '$effectedAt' },
					year: { $year: '$effectedAt' },
				},
				credit: { $sum: '$value' },
			},
		},
		{ $sort: { '_id.year': 1, '_id.month': 1 } },
	])

	return transactionCredit
}

async function getFutureTransactionDebit(userId) {
	const paramsDebit = {
		userId: userId,
		transactionType: 'planejamento',
		value: { $lte: 0 },
	}
	const transactionDebit = await transactionModel.aggregate([
		{ $match: paramsDebit },
		{
			$group: {
				_id: {
					month: { $month: '$effectedAt' },
					year: { $year: '$effectedAt' },
				},
				debit: { $sum: '$value' },
			},
		},
		{ $sort: { '_id.year': 1, '_id.month': 1 } },
	])

	return transactionDebit
}

function getMinData(transactionDebit, transactionCredit) {
	let minDate = new Date()
	minDate.setDate('10')

	let minDateCredit
	let minDateDebit
	let minDateCard

	if (transactionCredit.length > 0) {
		minDateCredit = new Date(
			transactionCredit[0]._id.year +
				'-' +
				transactionCredit[0]._id.month +
				'-10'
		)
	}
	if (transactionDebit.length > 0) {
		minDateDebit = new Date(
			transactionDebit[0]._id.year + '-' + transactionDebit[0]._id.month + '-10'
		)
	}

	if (minDateCredit < minDate) minDate = minDateCredit
	if (minDateDebit < minDate) minDate = minDateDebit
	if (minDateCard < minDate) minDate = minDateCard

	return minDate
}

function getMaxData(transactionDebit, transactionCredit) {
	let maxDate = new Date()
	maxDate.setDate('10')

	let maxDateCredit
	let maxDateDebit
	let maxDateCard

	if (transactionCredit.length > 0) {
		const tam = transactionCredit.length - 1
		maxDateCredit = new Date(
			transactionCredit[tam]._id.year +
				'-' +
				transactionCredit[tam]._id.month +
				'-10'
		)
	}
	if (transactionDebit.length > 0) {
		const tam = transactionDebit.length - 1
		maxDateDebit = new Date(
			transactionDebit[tam]._id.year +
				'-' +
				transactionDebit[tam]._id.month +
				'-10'
		)
	}

	if (maxDateCredit > maxDate) maxDate = maxDateCredit
	if (maxDateDebit > maxDate) maxDate = maxDateDebit
	if (maxDateCard > maxDate) maxDate = maxDateCard

	return maxDate
}

function validateTransactionOnUpdate(transactionToUpdate) {
	let requested = ['bankId', 'value', 'description']
	const response = utils.validateRequestedElements(
		transactionToUpdate,
		requested
	)
	if (response)
		return 'Os atributo(s) a seguir não foi(ram) informados: ' + response

	if (!utils.isNumeric(transactionToUpdate.value))
		return 'Valor informado não é válido'

	if (transactionToUpdate.finalRecurrence <= 0)
		return 'Recorrência menor ou igual a zero. Deixe em branco em caso de única transação.'
}

async function validadeTransactionOnCreate(userId, transactionToCreate) {
	validateTransactionOnUpdate(transactionToCreate)

	if (!(await existBank(userId, transactionToCreate.bankId)))
		return 'Banco não encontrado'
}

async function existBank(userId, bankId) {
	const { data: bankFind } = await bankController.getBank(userId, bankId)
	if (isEmpty(bankFind)) return false
	return true
}

async function updateSaldoContaCorrente(userId, bankId, valor) {
	const { data: bankFind } = await bankController.getBank(userId, bankId)

	if (bankFind) {
		const finalBalance = round(bankFind.systemBalance + valor, 2)
		bankFind.systemBalance = finalBalance

		await bankController.updateBank(userId, bankId, bankFind)
	} else {
		logger.warn('ATENÇÃO!! Banco não encontrado ao atualizar o saldo!')
	}
}
