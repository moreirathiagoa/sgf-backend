const _ = require('lodash')
const utils = require('../utils')
const db = require('../database')
const model = require('../model')
const jwt = require('jsonwebtoken')
const properties = require('../properties')
const bcrypt = require('bcrypt')

async function login(user){
    try {

        const params = { userName: user.userName.toLowerCase() }
        let userFinded = await db.findOne(model.userModel, params)

        const accessGranted = await bcrypt.compareSync(user.userPassword, userFinded.userPassword)
        
        if (!accessGranted)
            return utils.makeResponse(401, 'Usuário ou senha inválida')

        userFinded.toObject()
        userFinded.loginList.push(utils.getMomentNow())
        if (userFinded.loginList.length > 50){
            userFinded.loginList.shift()
        }

        await model.userModel.updateOne(
            params,
            userFinded,
            (err, res) => {
                if (err) {
                    throw new Error(err)
                }
            }
        )
        
        const tokenContent = {
            userId: userFinded._id,
            userName: userFinded.userName
        }

        const tokenExpiration = user.remember?'30d':'30m'

        const keyToken= properties.keyToken    
        const option = { expiresIn: tokenExpiration }
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
