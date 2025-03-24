require('./src/database').start()
const db = require('./src/database')
const transactionModel = require('./src/model/transactionModel')
require('./src/model/bankModel')

async function main() {
	let params = {}
	//params = { _id: '67d9efd8ed8ee85e71b634a5' }
	//params = { bankName: { $exists: false } }

	const transactionFind = await db
		.find(transactionModel, { ...params })
		.populate('bankId')
		.sort({ effectedAt: 1 })

	const toSave = transactionFind.map((t) => {
		const bankName =
			new Date(t._doc.effectedAt).getTime() >
			new Date('2025-01-01T03:00:00.000Z').getTime()
				? t._doc.bankId.name.replace(/^[\w\d]+\. /, '')
				: new Date(t._doc.effectedAt).getTime() >
				  new Date('2021-02-01T03:00:00.000Z').getTime()
				? `${t._doc.bankId.name.replace(/^[\w\d]+\. /, '')} *`
				: 'Desconhecido'

		const res = {
			...t._doc,
			bankName: bankName,
			bankId: t._doc.bankId._id,
		}

		delete res.category_id

		return res
	})

	for (const t of toSave) {
		console.log('>>>> t: ', t)
		const updateData = { ...t }
		const unsetFields = {}
		Object.keys(transactionModel.schema.paths).forEach((key) => {
			if (!(key in t)) {
				unsetFields[key] = ''
			}
		})
		const updateQuery = {
			$set: updateData,
			...(Object.keys(unsetFields).length > 0 ? { $unset: unsetFields } : {}),
		}
		const params = { _id: t._id }
		const res = await transactionModel.findOneAndUpdate(params, updateQuery, {
			new: true,
		})
		console.log('>>>> r: ', res)
	}

	console.log('FIM!!')
}

main()
