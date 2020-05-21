const _ = require('lodash')
const utils = require('../utils')
const db = require('../database')
const model = require('../model')

async function getListCategory() {

    const params = { userId: global.userId }
    try {
        const categoryFind = await db.find(model.categoryModel, params).sort('name')
        if (_.isEmpty(categoryFind))
            return utils.makeResponse(203, 'Categorias não encontradas', [])

        return utils.makeResponse(200, 'Lista de Categorias', categoryFind)
    } catch (error) {
        throw {
            error: error
        }
    }
}

async function getCategory(idCategory) {
    try {

        const params = { _id: idCategory, userId: global.userId }
        const categoryFind = await db.findOne(model.categoryModel, params)
        if (_.isEmpty(categoryFind))
            return utils.makeResponse(203, 'Categoria não encontrada')

        return utils.makeResponse(200, 'Categoria encontrada', categoryFind)
    } catch (error) {
        throw {
            error: error
        }
    }
}

async function createCategory(categoryToCreate) {
    try {
        const validation = await validadeCategory(categoryToCreate)
        if (validation)
            return utils.makeResponse(203, validation)

        const params = { name: categoryToCreate.name, userId: global.userId }
        const categoryFind = await db.findOne(model.categoryModel, params)
        if (!_.isEmpty(categoryFind))
            return utils.makeResponse(203, 'Categoria já cadastrada')

        categoryToCreate.userId = global.userId
        categoryToCreate.createDate = utils.actualDateToBataBase()

        const categoryToSave = new model.categoryModel(categoryToCreate)
        const response = await db.save(categoryToSave)
        return utils.makeResponse(201, 'Categoria criada com sucesso', response)
    } catch (error) {
        throw {
            error: error
        }
    }
}

async function updateCategory(idCategory, categoryToUpdate) {
    try {
        const validation = await validadeCategory(categoryToUpdate)
        if (validation)
            return utils.makeResponse(203, validation)

        let param = { name: categoryToUpdate.name, userId: global.userId }
        let categoryFind = await db.findOne(model.categoryModel, param)
        if (!_.isEmpty(categoryFind)) {
            if (categoryFind._id != idCategory)
                return utils.makeResponse(203, 'Categoria já cadastrada')
        }

        params = { _id: idCategory, userId: global.userId }
        categoryFind = await db.findOne(model.categoryModel, params)

        if (_.isEmpty(categoryFind)) {
            return utils.makeResponse(203, 'Categoria não encontrada')
        }

        await model.categoryModel.updateOne(
            params,
            categoryToUpdate,
            (err, res) => {
                if (err) {
                    throw new Error(err)
                }
            }
        )

        const categoryReturn = await db.findOne(model.categoryModel, params)
        return utils.makeResponse(202, 'Categoria atualizada com sucesso', categoryReturn)
    } catch (error) {
        throw {
            error: error
        }
    }
}

async function deleteCategory(idCategory) {
    try {

        const params = { _id: idCategory, userId: global.userId }
        const categoryFind = await db.findOne(model.categoryModel, params)
        if (_.isEmpty(categoryFind))
            return utils.makeResponse(203, 'Categoria não encontrada')

        const categoryToDelete = new model.categoryModel(categoryFind)
        const response = await db.remove(categoryToDelete)
        return utils.makeResponse(202, 'Categoria removida com sucesso', response)
    } catch (error) {
        throw {
            error: error
        }
    }
}

function validadeCategory(categoryToCreate) {

    requireds = ['name']
    const response = utils.validateRequiredsElements(categoryToCreate, requireds)
    if (response)
        return 'Os atributo(s) a seguir não foi(ram) informados: ' + response

    if (categoryToCreate.name.length < 3)
        return 'O nome não pode ter menos de 3 caracteres'
}

module.exports = {
    getListCategory,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
}
