const { isEmpty } = require('lodash')
const utils = require('../utils')
const db = require('../database')
const model = require('../model')
const bcrypt = require('bcryptjs')

async function getListUsers() {
	try {
		const userFound = await db.find(model.user).select('userName isActive')
		if (isEmpty(userFound))
			return utils.makeResponse(203, 'Usuários não encontrados', [])

		return utils.makeResponse(200, 'Lista de Usuários', userFound)
	} catch (error) {
		throw error
	}
}

async function getUser(idUser) {
	try {
		const params = { _id: idUser }
		const userFound = await db
			.findOne(model.user, params)
			.select('userName isActive')
		if (isEmpty(userFound))
			return utils.makeResponse(203, 'Usuários não encontrado')

		return utils.makeResponse(200, 'Usuários encontrado', userFound)
	} catch (error) {
		throw error
	}
}

async function createUser(userToCreate) {
	try {
		const validation = validateUser(userToCreate)
		if (validation) return utils.makeResponse(203, validation)

		const params = { userName: userToCreate.userName }
		const userFound = await db.findOne(model.user, params)
		if (!isEmpty(userFound))
			return utils.makeResponse(203, 'Usuários já cadastrado')

		const salt = bcrypt.genSaltSync(15)
		userToCreate.userPassword = bcrypt.hashSync(userToCreate.userPassword, salt)
		userToCreate.createdAt = utils.actualDateToBataBase()

		const userToSave = new model.user(userToCreate)
		let response = await db.save(userToSave)
		response = response.toObject()
		delete response.userPassword
		return utils.makeResponse(201, 'Usuários criado com sucesso', response)
	} catch (error) {
		throw error
	}
}

async function updateUser(idUser, userToUpdate) {
	try {
		const validation = validateUser(userToUpdate)
		if (validation) return utils.makeResponse(203, validation)

		let param = { userName: userToUpdate.userName }
		let userFound = await db.findOne(model.user, param)
		if (!isEmpty(userFound)) {
			if (userFound._id != idUser)
				return utils.makeResponse(203, 'Usuários já cadastrado')
		}

		params = { _id: idUser }
		userFound = await db.findOne(model.user, params)

		if (isEmpty(userFound)) {
			return utils.makeResponse(203, 'Usuários não encontrado')
		}

		const salt = bcrypt.genSaltSync(15)
		userToUpdate.userPassword = bcrypt.hashSync(userToUpdate.userPassword, salt)

		let userReturn = await model.user.findOneAndUpdate(params, userToUpdate, {
			new: true,
		})

		userReturn = userReturn.toObject()
		delete userReturn.userPassword
		return utils.makeResponse(
			202,
			'Usuários atualizado com sucesso',
			userReturn
		)
	} catch (error) {
		throw error
	}
}

function validateUser(userToCreate) {
	let requested = ['userName', 'userPassword']
	const response = utils.validateRequestedElements(userToCreate, requested)
	if (response)
		return 'Os atributo(s) a seguir não foi(ram) informados: ' + response

	if (userToCreate.userName.length < 3)
		return 'O nome de usuário não pode ter menos de 3 caracteres'
}

module.exports = {
	getListUsers,
	getUser,
	createUser,
	updateUser,
}
