require('./src/database').start()
const db = require('./src/database')
const model = require('./src/model')

async function main() {
	const transactionFind = await db
		.find(model.transaction, {
			typeTransaction: { $ne: 'planejamento' },
			efectedDate: { $lt: new Date('2025-03-01').toISOString() },
		})
		.sort({ efectedDate: -1 })
		.populate('category_id', 'name')
		.populate('bank_id', 'name')

	// console.log('transactionFind: ', transactionFind)
	// return
	const toSave = transactionFind.map((t) => {
		const res = {
			...t._doc,
			bank_id: t.bank_id._id,
			category_id: t?.category_id?._id,
			detail: t.description,
			description: t?.category_id?.name,
			bankName: t.bank_id.name,
		}
		return res
	})

	for (const t of toSave) {
		const params = { _id: t._id }
		const res = await model.transaction.findOneAndUpdate(params, t, {
			new: true,
		})
		console.log('>>>> r: ', res)
	}

	console.log('FIM!!')
}

main()
