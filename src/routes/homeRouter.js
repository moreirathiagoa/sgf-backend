const express = require('express')
const router = express.Router()

/**
 * @swagger
 * /:
 *   get:
 *     summary: Home
 *     description: >-
 *       Possibilita verificar se a aplicação está respondendo na home sem problemas
 *     responses:
 *       '200':
 *         description: Yoda {version number}
 */
router.get('/', (req, res, next) => {
    res.status(200).send({
        title: 'SGF',
        version: '1.0.0',
        message: 'Funcionando!'
    })
})

module.exports = router
