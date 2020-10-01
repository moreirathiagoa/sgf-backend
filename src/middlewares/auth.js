const jwt = require('jsonwebtoken')
const utils = require('../utils')
const properties = require('../properties')

const auth = (req, res, next) => {
	let log = req.route.path
	const tokenHeader = req.headers.auth

	if (!tokenHeader) {
		res.status(401).send(utils.makeResponse(401, 'token não informado'))
	}

	const keyToken = properties.keyToken

	jwt.verify(tokenHeader, keyToken, (err, decoded) => {
		if (err) {
			res.status(401).send(utils.makeResponse(401, 'token inválido'))
			log += ' - Invalid User'
		} else {
			res.locals.authData = decoded
			log += ' - ' + decoded.userName
			return next()
		}
	})
	console.log(log)
}

module.exports = auth
