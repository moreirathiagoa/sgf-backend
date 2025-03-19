const { isEmpty, round } = require('lodash')
const utils = require('../utils')
const db = require('../database')
const model = require('../model')
const transactionController = require('./transactionController')
const logger = require('../../config/logger')

async function getListBanks(transactionType, filters) {
	try {
		let params = { userId: global.userId }

		if (filters) {
			if (filters.isActive) {
				params.isActive = filters.isActive
			}
		}

		switch (transactionType) {
			case 'contaCorrente':
			case 'planejamento':
				params.bankType = { $in: ['Conta Corrente', 'Conta Cartão'] }
				break

			case 'cartaoCredito':
				params.bankType = { $in: ['Cartão de Crédito'] }
				break

			default:
				break
		}

		const bankFind = await db.find(model.bank, params).sort('name')
		if (isEmpty(bankFind))
			return utils.makeResponse(203, 'Bancos não encontrados', [])

		return utils.makeResponse(200, 'Lista de Bancos', bankFind)
	} catch (error) {
		logger.error(`Erro ao obter a lista de bancos - ${error.message || error}`)
		throw error
	}
}

async function getListBanksDashboard() {
	try {
		let params = {
			userId: global.userId,
			bankType: { $in: ['Conta Corrente', 'Conta Cartão'] },
		}
		const bankFind = await db.find(model.bank, params).sort('name')
		if (isEmpty(bankFind))
			return utils.makeResponse(203, 'Bancos não encontrados', [])

		const transactionNotCompensatedByBank =
			await transactionController.transactionNotCompensatedByBank()

		let banksToReturn = []

		bankFind.forEach((bank) => {
			const result = transactionNotCompensatedByBank.data.filter(
				(saldoBank) => {
					return saldoBank.bankId.toString() === bank._id.toString()
				}
			)

			let saldoNotCompensated
			if (result.length > 0) {
				saldoNotCompensated = result[0].saldoNotCompesated
			} else {
				saldoNotCompensated = 0
			}

			const saldoSistemaDeduzido = bank.systemBalance - saldoNotCompensated
			const diference = saldoSistemaDeduzido - bank.manualBalance
			const content = {
				id: bank._id,
				name: bank.name,
				isActive: bank.isActive,
				bankType: bank.bankType,
				saldoSistemaDeduzido: round(saldoSistemaDeduzido, 2),
				saldoSistema: round(bank.systemBalance, 2),
				saldoManual: round(bank.manualBalance, 2),
				diference: round(diference, 2),
			}
			banksToReturn.push(content)
		})

		return utils.makeResponse(200, 'Lista de Bancos', banksToReturn)
	} catch (error) {
		logger.error(`Erro ao obter a lista de bancos - ${error.message || error}`)
		throw error
	}
}

async function getBank(idBank) {
	try {
		const params = { _id: idBank, userId: global.userId }
		const bankFind = await db.findOne(model.bank, params)
		if (isEmpty(bankFind))
			return utils.makeResponse(203, 'Banco não encontrado')

		return utils.makeResponse(200, 'Banco encontrado', bankFind)
	} catch (error) {
		logger.error(`Erro ao obter a lista de bancos - ${error.message || error}`)
		throw error
	}
}

async function createBank(bankToCreate) {
	try {
		const validation = validateBank(bankToCreate)
		if (validation) return utils.makeResponse(203, validation)

		const params = { name: bankToCreate.name, userId: global.userId }
		const bankFind = await db.findOne(model.bank, params)
		if (!isEmpty(bankFind))
			return utils.makeResponse(203, 'Banco já cadastrado')

		bankToCreate.userId = global.userId
		bankToCreate.createdAt = utils.actualDateToBataBase()

		const bankToSave = new model.bank(bankToCreate)
		const response = await db.save(bankToSave)
		return utils.makeResponse(201, 'Banco criado com sucesso', response)
	} catch (error) {
		logger.error(`Erro ao obter a lista de bancos - ${error.message || error}`)
		throw error
	}
}

async function updateBank(idBank, bankToUpdate) {
	try {
		const paramsName = { name: bankToUpdate.name, userId: global.userId }
		const bankFindByName = await db.findOne(model.bank, paramsName)
		if (!isEmpty(bankFindByName)) {
			if (bankFindByName._id != idBank)
				return utils.makeResponse(203, 'Banco já cadastrado')
		}

		const paramsId = { _id: idBank, userId: global.userId }
		const bankFindById = await db.findOne(model.bank, paramsId)

		if (isEmpty(bankFindById)) {
			return utils.makeResponse(203, 'Banco não encontrado')
		}

		Object.assign(bankFindById, bankToUpdate)

		bankFindById.save()

		const bankToReturn = await db.findOne(model.bank, paramsId)
		return utils.makeResponse(
			202,
			'Banco atualizado com sucesso',
			bankToReturn
		)
	} catch (error) {
		logger.error(`Erro ao obter a lista de bancos - ${error.message || error}`)
		throw error
	}
}

async function deleteBank(idBank) {
	try {
		const paramsBank = { _id: idBank, userId: global.userId }
		const bankFind = await db.findOne(model.bank, paramsBank)
		if (isEmpty(bankFind))
			return utils.makeResponse(203, 'Banco não encontrado')

		const paramsTransaction = { bankId: idBank, userId: global.userId }

		const transactionFind = await db.findOne(
			model.transaction,
			paramsTransaction
		)
		if (!isEmpty(transactionFind))
			return utils.makeResponse(
				203,
				'Banco possui transações atreladas e não pode ser removido.'
			)

		const bankToDelete = new model.bank(bankFind)
		const response = await db.remove(bankToDelete)
		return utils.makeResponse(202, 'Banco removido com sucesso', response)
	} catch (error) {
		logger.error(`Erro ao obter a lista de bancos - ${error.message || error}`)
		throw error
	}
}

function validateBank(bankToCreate) {
	let requested = ['name', 'bankType']
	const response = utils.validateRequestedElements(bankToCreate, requested)
	if (response)
		return 'Os atributo(s) a seguir não foi(ram) informados: ' + response

	if (bankToCreate.name.length < 3)
		return 'O nome não pode ter menos de 3 caracteres'

	let arr = ['Conta Corrente', 'Conta Cartão', 'Cartão de Crédito', 'Poupança']

	if (!arr.includes(bankToCreate.bankType))
		return 'O tipo de banco não foi informado corretamente'
}

module.exports = {
	getListBanks,
	getBank,
	createBank,
	updateBank,
	deleteBank,
	getListBanksDashboard,
}
