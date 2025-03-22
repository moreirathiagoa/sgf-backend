const { isEmpty, round } = require('lodash')
const utils = require('../utils')
const db = require('../database')
const transactionController = require('./transactionController')
const logger = require('../../config/logger')
const bankModel = require('../model/bankModel')
const transactionModel = require('../model/transactionModel')

async function getListBanks(userId, transactionType, filters) {
	try {
		let params = { userId: userId }

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

		const bankFind = await db.find(bankModel, params).sort('name')
		if (isEmpty(bankFind))
			return utils.makeResponse(203, 'Bancos não encontrados', [])

		return utils.makeResponse(200, 'Lista de Bancos', bankFind)
	} catch (error) {
		logger.error(`Erro ao obter a lista de bancos - ${error.message || error}`)
		throw error
	}
}

async function getListBanksDashboard(userId) {
	try {
		let params = {
			userId: userId,
			bankType: { $in: ['Conta Corrente', 'Conta Cartão'] },
		}
		const bankFind = await db.find(bankModel, params).sort('name')
		if (isEmpty(bankFind))
			return utils.makeResponse(203, 'Bancos não encontrados', [])

		const transactionNotCompensatedByBank =
			await transactionController.transactionNotCompensatedByBank(userId)

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

async function getBank(userId, idBank) {
	try {
		const params = { _id: idBank, userId: userId }
		const bankFind = await db.findOne(bankModel, params)
		if (isEmpty(bankFind))
			return utils.makeResponse(203, 'Banco não encontrado')

		return utils.makeResponse(200, 'Banco encontrado', bankFind)
	} catch (error) {
		logger.error(`Erro ao obter a lista de bancos - ${error.message || error}`)
		throw error
	}
}

async function createBank(userId, bankToCreate) {
	try {
		const validation = validateBank(bankToCreate)
		if (validation) return utils.makeResponse(203, validation)

		const params = { name: bankToCreate.name, userId: userId }
		const bankFind = await db.findOne(bankModel, params)
		if (!isEmpty(bankFind))
			return utils.makeResponse(203, 'Banco já cadastrado')

		bankToCreate.userId = userId
		bankToCreate.createdAt = utils.actualDateToBataBase()

		const bankToSave = new bankModel(bankToCreate)
		const response = await db.save(bankToSave)
		return utils.makeResponse(201, 'Banco criado com sucesso', response)
	} catch (error) {
		logger.error(`Erro ao obter a lista de bancos - ${error.message || error}`)
		throw error
	}
}

//TODO ao atualizar o banco, renomear todos bankName das transações futuras (não compensadas na conta corrente ou planejamento)
async function updateBank(userId, idBank, bankToUpdate) {
	try {
		const paramsName = { name: bankToUpdate.name, userId: userId }
		const bankFindByName = await db.findOne(bankModel, paramsName)
		if (!isEmpty(bankFindByName)) {
			if (bankFindByName._id != idBank)
				return utils.makeResponse(203, 'Banco já cadastrado')
		}

		const paramsId = { _id: idBank, userId: userId }
		const bankFindById = await db.findOne(bankModel, paramsId)

		if (isEmpty(bankFindById)) {
			return utils.makeResponse(203, 'Banco não encontrado')
		}

		Object.assign(bankFindById, bankToUpdate)

		bankFindById.save()

		const bankToReturn = await db.findOne(bankModel, paramsId)
		return utils.makeResponse(202, 'Banco atualizado com sucesso', bankToReturn)
	} catch (error) {
		logger.error(`Erro ao obter a lista de bancos - ${error.message || error}`)
		throw error
	}
}

async function deleteBank(userId, idBank) {
	try {
		const paramsBank = { _id: idBank, userId: userId }
		const bankFind = await db.findOne(bankModel, paramsBank)
		if (isEmpty(bankFind))
			return utils.makeResponse(203, 'Banco não encontrado')

		const paramsTransaction = { bankId: idBank, userId: userId }

		const transactionFind = await db.findOne(
			transactionModel,
			paramsTransaction
		)
		if (!isEmpty(transactionFind))
			return utils.makeResponse(
				203,
				'Banco possui transações atreladas e não pode ser removido.'
			)

		const bankToDelete = new bankModel(bankFind)
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
