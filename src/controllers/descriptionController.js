const { isEmpty } = require('lodash')
const utils = require('../utils')
const db = require('../database')
const model = require('../model')

const MAX_WIN_ITENS = 10
const MAX_NEW_ITENS = 5
const MAX_COUNT_PER_ITEM = 5
const MAX_TOTAL_COUNT = MAX_WIN_ITENS * MAX_COUNT_PER_ITEM

async function getDescriptions() {
	const winnerDescriptions = await db
		.find(model.description, {
			userId: global.userId,
		})
		.sort({ count: -1, lastUpdate: -1 })
		.limit(MAX_WIN_ITENS)

	const newestDescriptions = await db
		.find(model.description, {
			userId: global.userId,
		})
		.sort({ lastUpdate: -1 })
		.limit(MAX_NEW_ITENS)

	const res = new Set()
	winnerDescriptions.forEach((d) => res.add(d.name))
	newestDescriptions.forEach((d) => res.add(d.name))

	return [...res]
}

async function createDescription(descriptionName) {
	if (!descriptionName) return

	const currentDescription = await db.findOne(model.description, {
		userId: global.userId,
		name: descriptionName,
	})

	if (isEmpty(currentDescription)) {
		const descriptionToSave = new model.description({
			userId: global.userId,
			name: descriptionName,
			createDate: utils.actualDateToBataBase(),
			lastUpdate: utils.actualDateToBataBase(),
			count: 0,
			isActive: true,
		})

		await db.save(descriptionToSave)
	} else {
		const descriptions = await db
			.find(model.description, {
				userId: global.userId,
				count: { $gt: 0 },
			})
			.sort({ count: -1 })
			.limit(MAX_WIN_ITENS)

		const totalCount = descriptions.reduce((acc, d) => acc + d.count, 0)

		if (totalCount >= MAX_TOTAL_COUNT) {
			const oldestDescription = descriptions.sort(
				(a, b) =>
					new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime()
			)[0]

			await model.description.findOneAndUpdate(
				{ name: oldestDescription.name },
				{ $inc: { count: -1 }, lastUpdate: utils.actualDateToBataBase() }
			)
		}

		const currentDescriptionCount =
			descriptions.find((d) => d.name === descriptionName)?.count || 0

		let contUpdate = {}
		if (currentDescriptionCount < MAX_COUNT_PER_ITEM) {
			contUpdate = { $inc: { count: 1 } }
		}

		await model.description.findOneAndUpdate(
			{ name: descriptionName },
			{ ...contUpdate, lastUpdate: utils.actualDateToBataBase() }
		)
	}
}

module.exports = {
	getDescriptions,
	createDescription,
}
