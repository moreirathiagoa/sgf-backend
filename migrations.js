require('./src/database').start()
const db = require('./src/database')
const model = require('./src/model')

async function main() {
	const transactionFind = await db
		.find(model.transaction, {})
		.sort({ efectedDate: -1 })

	// console.log('transactionFind: ', transactionFind)
	// return
	const toSave = transactionFind.map((t) => {
		const res = {
			...t._doc,
			createdAt: t.createDate,
			effectedAt: t.efectedDate,
			isCompensated: t.isCompesed,
			transactionType: t.typeTransaction,
			bankId: t.bank_id,
		}
		return res
	})

	for (const t of toSave) {
		console.log('>>>> t: ', t)
		const params = { _id: t._id }
		const res = await model.transaction.findOneAndUpdate(params, t, {
			new: true,
		})
		console.log('>>>> r: ', res)
	}

	console.log('FIM!!')
}

main()
