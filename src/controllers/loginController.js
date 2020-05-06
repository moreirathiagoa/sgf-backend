const _ = require('lodash')
const utils = require('../utils')
const db = require('../database')
const model = require('../model')
const jwt = require('jsonwebtoken')
const moment = require('moment')
const properties = require('../properties')

const createToken = (user_id) =>{
    return 
}

async function login(user){
    try {
        //remember
        //verificar se usuário existe no env
        if (user.userName != properties.defaultUserName || user.password != properties.defaultUserPassword)
            return utils.makeResponse(401, 'Usuário ou senha inválida')
        
        const tokenContent = {
            userName: user.userName,
            trustComputer: user.remember
        }
        const keyToken= properties.keyToken    
        const option = { expiresIn: '30m' }
        const token = jwt.sign(tokenContent, keyToken, option)
        
        const response = {
            userName: user.userName,
            token: token
        }
        
        return utils.makeResponse(200, 'Login Efetuado', response)
    } catch (error) {
        throw {
            error: error
        }
    }
}

module.exports = {
    login
}
