const jwt = require('jsonwebtoken')
const utils = require('../utils')
const { KEY_TOKEN } = require('../properties')

const auth = (req, res, next) => {
	const router = req.route.path
	const tokenHeader = req.headers.auth

	if (!tokenHeader) {
		logger.error({ router }, 'Token não informado')
		res.status(401).send(utils.makeResponse(401, 'token não informado'))
		return
	}

	jwt.verify(tokenHeader, KEY_TOKEN, (err, decoded) => {
		if (err) {
			logger.error({ router }, 'Token Inválido')
			res.status(401).send(utils.makeResponse(401, 'token inválido'))
			return
		} else {
			const user = decoded.userName
			logger.info({ router, user })
			res.locals.authData = decoded
			return next()
		}
	})
}

module.exports = auth
