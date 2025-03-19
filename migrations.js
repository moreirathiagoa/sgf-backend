require('./src/database').start()
const db = require('./src/database')
const model = require('./src/model')

async function main() {
	let params = {}
	//params = { _id: '67d9efd8ed8ee85e71b634a5' }

	const transactionFind = await db
		.find(model.transaction, { ...params })
		.sort({ efectedDate: -1 })

	const toSave = transactionFind.map((t) => {
		const res = {
			...t._doc,
		}
		delete res.createDate
		delete res.efectedDate
		delete res.isCompesed
		delete res.typeTransaction
		delete res.bank_id
		delete res.category_id
		delete res.fature_id

		return res
	})

	for (const t of toSave) {
		console.log('>>>> t: ', t)

		const updateData = { ...t }
		const unsetFields = {}

		Object.keys(model.transaction.schema.paths).forEach((key) => {
			if (!(key in t)) {
				unsetFields[key] = ''
			}
		})

		const updateQuery = {
			$set: updateData,
			...(Object.keys(unsetFields).length > 0 ? { $unset: unsetFields } : {}),
		}

		const params = { _id: t._id }
		const res = await model.transaction.findOneAndUpdate(params, updateQuery, {
			new: true,
		})

		console.log('>>>> r: ', res)
	}

	console.log('FIM!!')
}

main()
