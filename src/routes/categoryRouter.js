const { isEmpty } = require('lodash')
const express = require('express')
const controller = require('../controllers')
const router = express.Router()
const auth = require('../middlewares/auth')

router.get('/list', auth, async (req, res, next) => {
	global.userId = res.locals.authData.userId
	try {
		const response = await controller.category.getListCategory(req.body)
		res.status(response.code).json(response)
	} catch (error) {
		res.status(500).json(error)
	}
})

router.get('/:idCategory', auth, async (req, res, next) => {
	global.userId = res.locals.authData.userId
	const { idCategory } = req.params
	try {
		const response = await controller.category.getCategory(idCategory)
		res.status(response.code).json(response)
	} catch (error) {
		res.status(500).json(error)
	}
})

router.post('/create', auth, async (req, res, next) => {
	global.userId = res.locals.authData.userId
	try {
		let response
		if (isEmpty(req.body)) {
			response = utils.makeResponse(204, 'Sem informação no corpo')
		} else {
			response = await controller.category.createCategory(req.body)
		}

		res.status(response.code).json(response)
	} catch (error) {
		res.status(500).json(error)
	}
})

router.put('/update/:idCategory', auth, async (req, res, next) => {
	global.userId = res.locals.authData.userId
	const { idCategory } = req.params

	try {
		let response
		if (isEmpty(req.body)) {
			response = utils.makeResponse(204, 'Sem informação no corpo')
		} else {
			response = await controller.category.updateCategory(idCategory, req.body)
		}
		res.status(response.code).json(response)
	} catch (error) {
		res.status(500).json(error)
	}
})

router.delete('/delete/:idCategory', auth, async (req, res, next) => {
	global.userId = res.locals.authData.userId
	const { idCategory } = req.params

	try {
		const response = await controller.category.deleteCategory(idCategory)
		res.status(response.code).json(response)
	} catch (error) {
		res.status(500).json(error)
	}
})

module.exports = router
