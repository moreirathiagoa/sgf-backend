const logAccess = (req, res, next) => {
	const router = req.route.path
	console.log(`User: desconhecido - Router: ${router}`)
	return next()
}

module.exports = logAccess
