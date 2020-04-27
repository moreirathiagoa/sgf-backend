const jwt = require('jsonwebtoken')
const utils = require('../utils')
const properties = require('../properties')

const auth = (req, res, next) => {

    const tokenHeader = req.headers.auth
    
    if (!tokenHeader) {
        console.log('token não informado');
        res.status(401).send(utils.makeResponse(401, 'token não informado'))
    }
    
    const keyToken= properties.keyToken    

    jwt.verify(tokenHeader, keyToken, (err, decoded)=>{
        if (err) {
            console.log('token inválido');
            res.status(401).send(utils.makeResponse(401, 'token inválido'))
        } else {
            console.log('token valido');
            console.log(decoded)
            res.locals.authData = decoded
        }
        return next()
    })
}

module.exports = auth
