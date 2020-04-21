const CONSTANT = require('../properties')
const mongoose = require('mongoose')
mongoose.Promise = global.Promise

mongoose
    .connect(CONSTANT.URI_DATABASE, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    })
    .then(() => {
        console.log('Conectado ao banco de dados com sucesso')
    })
    .catch((err) => {
        console.log('Não foi possível conectar ao banco de dados: ' + err)
        process.exit
    })

/**
 * Função que salva o modelo no banco de dados
 * @param {Model} model Modelo para ser persistido no Banco de dados
 * @author {Thiago Moreira}
 */
function save(model) {
    try {
        return model.save()
    } catch (error) {
        throw new Error({
            message:
                'Ocorreu um erro ao tentar salvar o objeto no banco de dados',
            data: error
        })
    }
}

/**
 * Função que salva o modelo no banco de dados
 * @param {Model} model Modelo para ser persistido no Banco de dados
 * @author {Thiago Moreira}
 */
function findOne(model, parameter) {
    try {
        return model.findOne(parameter)
    } catch (error) {
        throw new Error({
            message:
                'Ocorreu um erro ao tentar buscar o objeto no banco de dados',
            data: error
        })
    }
}

async function remove(model) {
    try {
        return model.remove()
    } catch (error) {
        throw new Error({
            message:
                'Ocorreu um erro ao tentar remover o objeto no banco de dados',
            data: error
        })
    }
}

module.exports = {
    mongoose,
    save,
    findOne,
    remove
}
