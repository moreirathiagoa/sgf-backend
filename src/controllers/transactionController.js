const { round, isEmpty } = require('lodash')
const utils = require('../utils')
const db = require('../database')
const model = require('../model')

async function getListTransaction(typeTransaction, filters) {
	try {
		const params = { typeTransaction: typeTransaction, userId: global.userId }
		if (filters) {
			const factoredFilters = prepareFilters(filters)

			Object.assign(params, factoredFilters)
		}

		const transactionFind = await db
			.find(model.transactionModel, params)
			.sort({ efectedDate: -1 })
			.populate('bank_id', 'name')
			.populate('category_id', 'name')
			.populate('fature_id', 'name')

		if (isEmpty(transactionFind))
			return utils.makeResponse(203, 'Transação não encontradas', [])

		return utils.makeResponse(200, 'Lista de Transações', transactionFind)
	} catch (error) {
		console.log(error)
		throw {
			error: error,
		}
	}
}

function prepareFilters(filters) {
	const { year, month, onlyFuture, bank_id, category_id, description } = filters

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
		efectedDate: {
			$gte: minimalDate.toISOString(),
			$lt: maximalDate.toISOString(),
		},
	}

	if (onlyFuture) {
		Object.assign(response, { isCompesed: false })
	}

	if (bank_id !== 'Selecione' && bank_id) {
		Object.assign(response, { bank_id: bank_id })
	}

	if (category_id !== 'Selecione' && category_id) {
		Object.assign(response, { category_id: category_id })
	}

	if (description) {
		Object.assign(response, {
			description: { $regex: description, $options: 'i' },
		})
	}

	return response
}

async function getTransaction(idTransaction) {
	try {
		const params = { _id: idTransaction, userId: global.userId }
		const transactionFind = await db
			.findOne(model.transactionModel, params)
			.populate('fature_id', 'name')
		if (isEmpty(transactionFind))
			return utils.makeResponse(203, 'Transação não encontradas', [])

		return utils.makeResponse(200, 'Transação encontrada', transactionFind)
	} catch (error) {
		console.log(error)
		throw {
			error: error,
		}
	}
}

async function bankTransference(data) {
	const { originalBankId, finalBankId, categoryId, value } = data

	const paramsOrigin = { _id: originalBankId, userId: global.userId }
	const originBankFind = await db.findOne(model.bankModel, paramsOrigin)
	if (isEmpty(originBankFind))
		return utils.makeResponse(203, 'Banco de origem não encontrado')

	const paramsFinal = { _id: finalBankId, userId: global.userId }
	const finalBankFind = await db.findOne(model.bankModel, paramsFinal)
	if (isEmpty(finalBankFind))
		return utils.makeResponse(203, 'Banco destino não encontrado')

	const debitTransaction = {
		efectedDate: new Date(),
		bank_id: originalBankId,
		category_id: categoryId,
		isSimples: false,
		value: -1 * value,
		isCompesed: true,
		typeTransaction: 'contaCorrente',
		description: `Para: ${finalBankFind.name}`,
	}

	const creditTransaction = {
		efectedDate: new Date(),
		bank_id: finalBankId,
		category_id: categoryId,
		isSimples: false,
		value: value,
		isCompesed: true,
		typeTransaction: 'contaCorrente',
		description: `De: ${originBankFind.name}`,
	}
	try {
		const response = await createTransaction(debitTransaction)
			.then((res) => {
				if (res.code == 201) {
					return createTransaction(creditTransaction)
				} else {
					throw new Erro('Erro no cadastro da primeira transação.')
				}
			})
			.then((res) => {
				if (res.code != 201) {
					throw new Erro('Erro no cadastro da segunda transação.')
				}
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

async function createTransaction(transactionToCreate) {
	try {
		const validation = await validadeTransaction(transactionToCreate)
		if (validation) return utils.makeResponse(203, validation)

		transactionToCreate.efectedDate = utils.formatDateToBataBase(
			transactionToCreate.efectedDate
		)

		transactionToCreate.userId = global.userId
		transactionToCreate.createDate = utils.actualDateToBataBase()

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

		const bankParams = {
			_id: transactionToCreate.bank_id,
			userId: global.userId,
		}
		const bankFind = await db.findOne(model.bankModel, bankParams)

		let fature
		if (transactionToCreate.typeTransaction === 'cartaoCredito') {
			fature = await getFature(transactionToCreate.fature, bankFind._id)
			delete transactionToCreate.fature
			transactionToCreate.fature_id = fature._id
			transactionToCreate.isCompesed = false
		}

		if (transactionToCreate.typeTransaction === 'planejamento') {
			transactionToCreate.isCompesed = false
		}

		let response = []
		for (let i = 0; i < totalTransaction; i++) {
			if (i > 0) {
				if (!transactionToCreate.isSimples) {
					transactionToCreate.currentRecurrence++
				}

				if (
					transactionToCreate.typeTransaction === 'contaCorrente' ||
					transactionToCreate.typeTransaction === 'planejamento'
				) {
					const nextDate = utils.addMonth(transactionToCreate.efectedDate, 1)
					transactionToCreate.efectedDate = utils.formatDateToBataBase(nextDate)
				}

				if (transactionToCreate.typeTransaction === 'cartaoCredito') {
					let now = new Date(fature.name.replace('/', '-') + '-10')
					now.setDate(now.getDate() + 30)

					const mes = now.getMonth() + 1
					const ano = now.getFullYear()
					let mesFinal = '00' + mes
					mesFinal = mesFinal.substr(mesFinal.length - 2)
					let fatureName = ano + '/' + mesFinal

					fature = await getFature(fatureName, bankFind._id)
					transactionToCreate.fature_id = fature._id
				}
			}
			const transactionToSave = new model.transactionModel(transactionToCreate)
			const transactionSaved = await db.save(transactionToSave)

			switch (transactionToCreate.typeTransaction) {
				case 'contaCorrente':
					await updateSaldoContaCorrente(bankFind._id, transactionSaved.value)
					break
				case 'cartaoCredito':
					await updateSaldoFatura(
						transactionSaved.fature_id,
						transactionSaved.value
					)
					break
				default:
			}

			response.push(transactionSaved)
		}

		if (response.length == 0)
			return utils.makeResponse(203, 'A transação não pode ser salva')

		return utils.makeResponse(201, 'Transação criada com sucesso', response)
	} catch (error) {
		console.log(error)
		throw {
			error: error,
		}
	}
}

async function updateTransaction(idTransaction, transactionToUpdate) {
	try {
		const validation = await validadeTransaction(transactionToUpdate)
		if (validation) return utils.makeResponse(203, validation)

		const params = { _id: idTransaction, userId: global.userId }
		const oldTransaction = await db.findOne(model.transactionModel, params)

		if (transactionToUpdate.typeTransaction === 'cartaoCredito') {
			transactionToUpdate.isCompesed = false
		}

		if (transactionToUpdate.typeTransaction === 'planejamento') {
			transactionToUpdate.isCompesed = false
		}

		transactionToUpdate.efectedDate = utils.formatDateToBataBase(
			transactionToUpdate.efectedDate
		)

		if (isEmpty(oldTransaction)) {
			return utils.makeResponse(203, 'Transação não encontrada')
		}

		await model.transactionModel.updateOne(
			params,
			transactionToUpdate,
			(err, res) => {
				if (err) {
					console.log(error)
					throw new Error(err)
				}
			}
		)

		const transactionReturn = await db.findOne(model.transactionModel, params)
		const saldoAdjust = transactionReturn.value - oldTransaction.value
		switch (transactionReturn.typeTransaction) {
			case 'contaCorrente': {
				if (
					transactionReturn.bank_id.toString() !=
					oldTransaction.bank_id.toString()
				) {
					await updateSaldoContaCorrente(
						transactionReturn.bank_id,
						transactionReturn.value
					)
					await updateSaldoContaCorrente(
						oldTransaction.bank_id,
						oldTransaction.value * -1
					)
				} else {
					await updateSaldoContaCorrente(transactionReturn.bank_id, saldoAdjust)
				}
				break
			}
			case 'cartaoCredito': {
				if (
					transactionReturn.fature_id.toString() !=
					oldTransaction.fature_id.toString()
				) {
					await updateSaldoFatura(
						transactionReturn.fature_id,
						transactionReturn.value
					)
					await updateSaldoFatura(
						oldTransaction.fature_id,
						oldTransaction.value * -1
					)
				} else {
					await updateSaldoFatura(transactionReturn.fature_id, saldoAdjust)
				}
				break
			}
			default:
		}

		return utils.makeResponse(
			202,
			'Categoria atualizada com sucesso',
			transactionReturn
		)
	} catch (error) {
		throw {
			error: error,
		}
	}
}

async function deleteTransaction(idTransaction) {
	try {
		const params = { _id: idTransaction, userId: global.userId }
		const transactionFind = await db.findOne(model.transactionModel, params)
		if (isEmpty(transactionFind))
			return utils.makeResponse(203, 'Transação não encontrada')

		const transactionToDelete = new model.transactionModel(transactionFind)
		const response = await db.remove(transactionToDelete)

		const saldoAdjust = -1 * transactionToDelete.value

		switch (transactionToDelete.typeTransaction) {
			case 'contaCorrente':
				await updateSaldoContaCorrente(transactionToDelete.bank_id, saldoAdjust)
				break
			case 'cartaoCredito':
				await updateSaldoFatura(transactionToDelete.fature_id, saldoAdjust)
				break
			default:
		}

		return utils.makeResponse(202, 'Transação removida com sucesso', response)
	} catch (error) {
		console.log(error)
		throw {
			error: error,
		}
	}
}

async function transactionNotCompensatedByBank() {
	const params = {
		userId: global.userId,
		typeTransaction: 'contaCorrente',
		isCompesed: false,
	}
	let response = await model.transactionModel.aggregate([
		{ $match: params },
		{
			$group: {
				_id: { bank_id: '$bank_id' },
				saldoNotCompesated: { $sum: '$value' },
			},
		},
	])

	let responseToSend = []
	response.forEach((el) => {
		el.bank_id = el._id.bank_id
		delete el._id
		responseToSend.push(el)
	})

	return utils.makeResponse(200, 'Saldo obtido com sucesso', responseToSend)
}

async function transactionNotCompensatedDebit() {
	const params = {
		userId: global.userId,
		isCompesed: false,
		typeTransaction: 'contaCorrente',
		value: { $lte: 0 },
	}
	let response = await model.transactionModel.aggregate([
		{ $match: params },
		{ $group: { _id: null, saldoNotCompesated: { $sum: '$value' } } },
	])

	let responseToSend
	if (response.length === 0) {
		responseToSend = 0
	} else {
		responseToSend = response[0].saldoNotCompesated
	}

	return utils.makeResponse(200, 'Saldo obtido com sucesso', responseToSend)
}

async function transactionNotCompensatedCredit() {
	const params = {
		userId: global.userId,
		isCompesed: false,
		typeTransaction: 'contaCorrente',
		value: { $gt: 0 },
	}
	let response = await model.transactionModel.aggregate([
		{ $match: params },
		{ $group: { _id: null, saldoNotCompesated: { $sum: '$value' } } },
	])
	let responseToSend
	if (response.length === 0) {
		responseToSend = 0
	} else {
		responseToSend = response[0].saldoNotCompesated
	}

	return utils.makeResponse(200, 'Saldo obtido com sucesso', responseToSend)
}

async function planToPrincipal(transactions) {
	const transactionToUpdate = {
		isCompesed: false,
		typeTransaction: 'contaCorrente',
	}

	let response = []

	for (let transaction of transactions) {
		await updateSaldoContaCorrente(transaction.bank_id, transaction.value)

		const params = { _id: transaction._id }
		const transactionToReturn = await model.transactionModel.updateOne(
			params,
			transactionToUpdate,
			(err, res) => {
				if (err) {
					console.log(error)
					throw new Error(err)
				}
			}
		)
		response.push(transactionToReturn)
	}

	return utils.makeResponse(201, 'Transação atualizada com sucesso', response)
}

async function futureTransactionBalance() {
	const transactionCredit = await getFutureTransactionCredit()
	const transactionDebit = await getFutureTransactionDebit()
	const cardDebit = await getCardTransactionDebit()

	if (
		transactionDebit.length == 0 &&
		transactionCredit.length == 0 &&
		cardDebit.length == 0
	) {
		return utils.makeResponse(203, 'Não existem saldos para retorno')
	}

	const minDate = getMinData(transactionDebit, transactionCredit, cardDebit)
	const maxDate = getMaxData(transactionDebit, transactionCredit, cardDebit)

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
		let finalCard = cardDebit.find((t) => {
			return t._id.month == month && t._id.year == year
		})

		const response = {
			month: month,
			year: year,
			debit: finalDebit ? finalDebit.debit : 0,
			credit: finalCredit ? finalCredit.credit : 0,
			card: finalCard ? finalCard.debit : 0,
		}

		responseToReturn.push(response)

		indexDate.setDate(indexDate.getDate() + 30)
	}

	return utils.makeResponse(200, 'Saldo obtido com sucesso', responseToReturn)
}

/* FUNÇÕES DE APOIO */

async function getFutureTransactionCredit() {
	const paramsCredit = {
		userId: global.userId,
		typeTransaction: 'planejamento',
		value: { $gt: 0 },
	}
	const transactionCredit = await model.transactionModel.aggregate([
		{ $match: paramsCredit },
		{
			$group: {
				_id: {
					month: {
						$month: { $dateFromString: { dateString: '$efectedDate' } },
					},
					year: { $year: { $dateFromString: { dateString: '$efectedDate' } } },
				},
				credit: { $sum: '$value' },
			},
		},
		{ $sort: { '_id.year': 1, '_id.month': 1 } },
	])

	return transactionCredit
}

async function getFutureTransactionDebit() {
	const paramsDebit = {
		userId: global.userId,
		typeTransaction: 'planejamento',
		value: { $lte: 0 },
	}
	const transactionDebit = await model.transactionModel.aggregate([
		{ $match: paramsDebit },
		{
			$group: {
				_id: {
					month: {
						$month: { $dateFromString: { dateString: '$efectedDate' } },
					},
					year: { $year: { $dateFromString: { dateString: '$efectedDate' } } },
				},
				debit: { $sum: '$value' },
			},
		},
		{ $sort: { '_id.year': 1, '_id.month': 1 } },
	])

	return transactionDebit
}

async function getCardTransactionDebit() {
	const params = {
		userId: global.userId,
		typeTransaction: 'cartaoCredito',
		isCompesed: false,
		value: { $lte: 0 },
	}

	const transactionGrouped = await model.transactionModel.aggregate([
		{ $match: params },
		{
			$group: {
				_id: {
					fature_id: '$fature_id',
				},
				debit: { $sum: '$value' },
			},
		},
	])

	let transactionNamed = []

	for (let el of transactionGrouped) {
		const fature_id = el._id.fature_id
		const fature = await db.findOne(model.faturesModel, { _id: fature_id })

		el._id.name = fature.name
		delete el._id.fature_id

		transactionNamed.push(el)
	}

	transactionNamed.sort(function (a, b) {
		if (a._id.name > b._id.name) {
			return 1
		}
		if (a._id.name < b._id.name) {
			return -1
		}
		// a must be equal to b
		return 0
	})

	const transactionToReturn = transactionNamed.map((fature) => {
		const fatureName = fature._id.name
		const year = fatureName.split('/')[0]
		const month = fatureName.split('/')[1]

		return {
			_id: {
				month: month,
				year: year,
			},
			debit: fature.debit,
		}
	})

	return transactionToReturn
}

function getMinData(transactionDebit, transactionCredit, cardDebit) {
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
	if (cardDebit.length > 0) {
		minDateCard = new Date(
			cardDebit[0]._id.year + '-' + cardDebit[0]._id.month + '-10'
		)
	}

	if (minDateCredit < minDate) minDate = minDateCredit
	if (minDateDebit < minDate) minDate = minDateDebit
	if (minDateCard < minDate) minDate = minDateCard

	return minDate
}

function getMaxData(transactionDebit, transactionCredit, cardDebit) {
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
	if (cardDebit.length > 0) {
		const tam = cardDebit.length - 1
		maxDateCard = new Date(
			cardDebit[tam]._id.year + '-' + cardDebit[tam]._id.month + '-10'
		)
	}

	if (maxDateCredit > maxDate) maxDate = maxDateCredit
	if (maxDateDebit > maxDate) maxDate = maxDateDebit
	if (maxDateCard > maxDate) maxDate = maxDateCard

	return maxDate
}

async function validadeTransaction(transactionToCreate) {
	let requested = ['category_id', 'bank_id', 'value']
	const response = utils.validateRequestedElements(
		transactionToCreate,
		requested
	)
	if (response)
		return 'Os atributo(s) a seguir não foi(ram) informados: ' + response

	if (!utils.isNumeric(transactionToCreate.value))
		return 'Valor informado não é válido'

	if (!(await existCategory(transactionToCreate.category_id)))
		return 'Categoria não encontrada'

	if (!(await existBank(transactionToCreate.bank_id)))
		return 'Banco não encontrado'

	if (transactionToCreate.finalRecurrence <= 0)
		return 'Recorrência menor ou igual a zero. Deixe em branco em caso de única transação.'
}

async function existCategory(idCategory) {
	const params = { _id: idCategory }
	const categoryFind = await db.findOne(model.categoryModel, params)
	if (isEmpty(categoryFind)) return false
	return true
}

async function existBank(idBank) {
	const params = { _id: idBank }
	const bankFind = await db.findOne(model.bankModel, params)
	if (isEmpty(bankFind)) return false
	return true
}

async function getFature(fatureName, bank_id) {
	const fatureParams = {
		name: fatureName,
		bank_id: bank_id,
		userId: global.userId,
	}
	let fature = await db.findOne(model.faturesModel, fatureParams)

	if (!fature) {
		fature = {
			userId: global.userId,
			name: fatureName,
			createDate: new Date(),
			bank_id: bank_id,
		}
		fature = new model.faturesModel(fature)
		await db.save(fature)
	}

	return fature
}

async function updateSaldoContaCorrente(idBank, valor) {
	const params = { _id: idBank, userId: global.userId }
	const bankFind = await db
		.findOne(model.bankModel, params)
		.select('systemBalance')

	const finalBalance = round(bankFind.systemBalance + valor, 2)
	const bankToUpdate = { systemBalance: finalBalance }

	await model.bankModel.updateOne(params, bankToUpdate, (err, res) => {
		if (err) {
			throw new Error(err)
		}
	})
}

async function updateSaldoFatura(idFatura, valor) {
	const fatureParams = { _id: idFatura, userId: global.userId }
	let fatureFind = await db
		.findOne(model.faturesModel, fatureParams)
		.select('fatureBalance')

	const finalBalance = round(fatureFind.fatureBalance + valor, 2)
	const fatureToUpdate = { fatureBalance: finalBalance }

	await model.faturesModel.updateOne(
		fatureParams,
		fatureToUpdate,
		(err, res) => {
			if (err) {
				throw new Error(err)
			}
		}
	)
}

module.exports = {
	getListTransaction,
	getTransaction,
	bankTransference,
	createTransaction,
	updateTransaction,
	deleteTransaction,
	transactionNotCompensatedByBank,
	transactionNotCompensatedDebit,
	transactionNotCompensatedCredit,
	planToPrincipal,
	futureTransactionBalance,
}
