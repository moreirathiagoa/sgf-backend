const _ = require('lodash')
const utils = require('../utils')
const db = require('../database')
const model = require('../model')

async function createCategory(categoryToCreate){
    try {
        await validadeCategory(categoryToCreate)

        const params = { name: categoryToCreate.name }
        const categoryFind = await db.findOne(model.categoryModel, params)
        if (!_.isEmpty(categoryFind))
            throw 'Categoria já cadastrada'

        const categoryToSave = new model.categoryModel(categoryToCreate)
        const response = await db.save(categoryToSave)
        return response
    } catch (error) {
        throw {
            error: error
        }
    }
}

async function updateCategory(idCategory, categoryToUpdate){
    try {
        await validadeCategory(categoryToUpdate)

        let param = { name: categoryToUpdate.name }
        let categoryFind = await db.findOne(model.categoryModel, param)
        if (!_.isEmpty(categoryFind)){
            if(categoryFind._id != idCategory)
                throw 'Categoria já cadastrada'
        }

        params = { _id: idCategory }
        categoryFind = await db.findOne(model.categoryModel, params)

        if (_.isEmpty(categoryFind)) {
            throw 'Categoria não encontrada'
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

        return categoryReturn
    } catch (error) {
        throw {
            error: error
        }
    }
}

async function deleteCategory(idCategory){
    try {
        
        const params = { _id: idCategory }
        const categoryFind = await db.findOne(model.categoryModel, params)
        if (_.isEmpty(categoryFind))
            throw 'Categoria não encontrada'

        const categoryToDelete = new model.categoryModel(categoryFind)
        const response = await db.remove(categoryToDelete)
        return response
    } catch (error) {
        throw {
            error: error
        }
    }
}

function validadeCategory(categoryToCreate){
    
    requireds = ['name']
    const response = utils.validateRequiredsElements(categoryToCreate, requireds)
    if(response)
        throw 'Os atributo(s) a seguir não foi(ram) informados: ' + response
    
    if (categoryToCreate.name.lenght < 3)
        throw 'O nome não pode ter menos de 3 caracteres'
}

module.exports = {
    createCategory,
    updateCategory,
    deleteCategory
}
