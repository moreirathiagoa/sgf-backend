const jwt = require('jsonwebtoken')
const utils = require('../utils')
const properties = require('../properties')

const auth = (req, res, next) => {

    const tokenHeader = req.headers.auth

    if (!tokenHeader) {
        console.log('token não informado');
        res.status(401).send(utils.makeResponse(401, 'token não informado'))
    }

    const keyToken = properties.keyToken

    jwt.verify(tokenHeader, keyToken, { ignoreExpiration: true }, (err, decoded) => {
        if (err) {
            res.status(401).send(utils.makeResponse(401, 'token inválido'))
        } else {
            var current_time = Date.now() / 1000;
            if (decoded.exp < current_time && !decoded.trustComputer) {
                res.status(401).send(utils.makeResponse(401, 'token inválido'))
            } else {
                //TODO: Verificar se Token está autorizado login permanente no mongo

                res.locals.authData = decoded
                return next()
            }
        }
    })
}

module.exports = auth
