const utils = require('../utils')
const db = require('../database')
const model = require('../model')
const jwt = require('jsonwebtoken')
const properties = require('../properties')
const bcrypt = require('bcryptjs')

async function login(user) {
	try {
		const params = { userName: user.userName.toLowerCase() }
		let userFound = await db.findOne(model.userModel, params)

		const accessGranted = await bcrypt.compareSync(
			user.userPassword,
			userFound.userPassword
		)

		if (!accessGranted)
			return utils.makeResponse(401, 'Usuário ou senha inválida')

		userFound.toObject()
		userFound.loginList.push(utils.actualDateToBataBase())
		if (userFound.loginList.length > 50) {
			userFound.loginList.shift()
		}

		userFound.save()

		const tokenContent = {
			userId: userFound._id,
			userName: userFound.userName,
		}

		const tokenExpiration = user.remember ? '30d' : '30m'

		const keyToken = properties.keyToken
		const option = { expiresIn: tokenExpiration }
		const token = jwt.sign(tokenContent, keyToken, option)

		const response = {
			userName: user.userName,
			token: token,
		}

		return utils.makeResponse(200, 'Login Efetuado', response)
	} catch (error) {
		throw error
	}
}

module.exports = {
	login,
}
