const _ = require('lodash')
const utils = require('../utils')
const db = require('../database')
const model = require('../model')
const transactionController = require('./transactionController')

async function getListBanks(typeTransaction) {
	try {
		let params = { userId: global.userId }
		switch (typeTransaction) {
			case 'contaCorrente':
				params.bankType = { $in: ['Conta Corrente', 'Conta Cartão'] }
				break

			case 'cartaoCredito':
				params.bankType = { $in: ['Cartão de Crédito'] }
				break

			case 'planejamento':
				params.bankType = { $in: ['Conta Corrente', 'Conta Cartão'] }
				break

			default:
				break
		}

		const bankFind = await db.find(model.bankModel, params).sort('name')
		if (_.isEmpty(bankFind))
			return utils.makeResponse(203, 'Bancos não encontrados', [])

		return utils.makeResponse(200, 'Lista de Bancos', bankFind)
	} catch (error) {
		console.log(error)
		throw {
			error: error,
		}
	}
}

async function getListBanksDahsboard() {
	try {
		let params = {
			userId: global.userId,
			bankType: { $in: ['Conta Corrente', 'Conta Cartão'] },
		}
		const bankFind = await db.find(model.bankModel, params).sort('name')
		if (_.isEmpty(bankFind))
			return utils.makeResponse(203, 'Bancos não encontrados', [])

		const transactionNotCompesedByBank = await transactionController.transactionNotCompesedByBank()

		let banksToReturn = []

		bankFind.forEach((bank) => {
			const result = transactionNotCompesedByBank.data.filter((saldoBank) => {
				return saldoBank.bank_id.toString() === bank._id.toString()
			})

			let saldoNotCompesated
			if (result.length > 0) {
				saldoNotCompesated = result[0].saldoNotCompesated
			} else {
				saldoNotCompesated = 0
			}

			const saldoSistemaDeduzido = bank.systemBalance - saldoNotCompesated
			const diference = saldoSistemaDeduzido - bank.manualBalance
			const content = {
				id: bank._id,
				name: bank.name,
				bankType: bank.bankType,
				saldoSistemaDeduzido: saldoSistemaDeduzido,
				saldoSistema: bank.systemBalance,
				saldoManual: bank.manualBalance,
				diference: diference,
			}
			banksToReturn.push(content)
		})

		return utils.makeResponse(200, 'Lista de Bancos', banksToReturn)
	} catch (error) {
		console.log(error)
		throw {
			error: error,
		}
	}
}

async function getBank(idBank) {
	try {
		const params = { _id: idBank, userId: global.userId }
		const bankFind = await db.findOne(model.bankModel, params)
		if (_.isEmpty(bankFind))
			return utils.makeResponse(203, 'Banco não encontrado')

		return utils.makeResponse(200, 'Banco encontrado', bankFind)
	} catch (error) {
		console.log(error)
		throw {
			error: error,
		}
	}
}

async function createBank(bankToCreate) {
	try {
		const validation = await validateBank(bankToCreate)
		if (validation) return utils.makeResponse(203, validation)

		const params = { name: bankToCreate.name, userId: global.userId }
		const bankFind = await db.findOne(model.bankModel, params)
		if (!_.isEmpty(bankFind))
			return utils.makeResponse(203, 'Banco já cadastrado')

		bankToCreate.userId = global.userId
		bankToCreate.createDate = utils.actualDateToBataBase()

		const bankToSave = new model.bankModel(bankToCreate)
		const response = await db.save(bankToSave)
		return utils.makeResponse(201, 'Banco criado com sucesso', response)
	} catch (error) {
		console.log(error)
		throw {
			error: error,
		}
	}
}

async function updateBank(idBank, bankToUpdate) {
	try {
		// const validation = await validateBank(bankToUpdate)
		// if (validation)
		//     return utils.makeResponse(203, validation)

		let param = { name: bankToUpdate.name, userId: global.userId }
		let bankFind = await db.findOne(model.bankModel, param)
		if (!_.isEmpty(bankFind)) {
			if (bankFind._id != idBank)
				return utils.makeResponse(203, 'Banco já cadastrado')
		}

		params = { _id: idBank, userId: global.userId }
		bankFind = await db.findOne(model.bankModel, params)

		if (_.isEmpty(bankFind)) {
			return utils.makeResponse(203, 'Banco não encontrado')
		}

		await model.bankModel.updateOne(params, bankToUpdate, (err, res) => {
			if (err) {
				throw new Error(err)
			}
		})

		const categoryReturn = await db.findOne(model.bankModel, params)
		return utils.makeResponse(
			202,
			'Banco atualizado com sucesso',
			categoryReturn
		)
	} catch (error) {
		console.log(error)
		throw {
			error: error,
		}
	}
}

async function deleteBank(idBank) {
	try {
		const params = { _id: idBank, userId: global.userId }
		const bankFind = await db.findOne(model.bankModel, params)
		if (_.isEmpty(bankFind))
			return utils.makeResponse(203, 'Banco não encontrado')

		const categoryToDelete = new model.bankModel(bankFind)
		const response = await db.remove(categoryToDelete)
		return utils.makeResponse(202, 'Banco removido com sucesso', response)
	} catch (error) {
		console.log(error)
		throw {
			error: error,
		}
	}
}

function validateBank(bankToCreate) {
	requireds = ['name', 'bankType']
	const response = utils.validateRequiredsElements(bankToCreate, requireds)
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
	getListBanksDahsboard,
}
