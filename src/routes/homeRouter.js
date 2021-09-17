const express = require('express')
const router = express.Router()
const logAccess = require('../middlewares/logAccess')

router.get('/', logAccess, async (req, res, next) => {
	try {
		res.status(200).send({
			title: 'SGF',
			version: '1.0.0',
			message: 'Sistema funcionando!',
		})
	} catch (error) {
		res.status(500).send({
			title: 'SGF',
			version: '1.0.0',
			message: 'Não Funcionou...',
			error: error.message,
		})
	}
})

module.exports = router
