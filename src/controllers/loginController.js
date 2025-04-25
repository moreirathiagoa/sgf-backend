const utils = require('../utils')
const jwt = require('jsonwebtoken')
const { KEY_TOKEN } = require('../properties')
const bcrypt = require('bcryptjs')
const usarController = require('./userController')

exports.login = async (user) => {
	try {
		let { data: userFound, code } = await usarController.getUserByUserName(
			user.userName
		)

		if (!code === 200)
			return utils.makeResponse(401, 'Usuário ou senha inválida')

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

		const option = { expiresIn: tokenExpiration }
		const token = jwt.sign(tokenContent, KEY_TOKEN, option)

		const response = {
			userName: user.userName,
			defaultDescription: userFound.defaultDescription,
			token: token,
		}

		return utils.makeResponse(200, 'Login Efetuado', response)
	} catch (error) {
		throw error
	}
}
