const { isEmpty } = require('lodash')
const utils = require('../utils')
const db = require('../database')
const descriptionModel = require('../model/descriptionsModel')

const MAX_WIN_ITENS = 15
const MAX_COUNT_PER_ITEM = 5
const MAX_TOTAL_COUNT = MAX_WIN_ITENS * MAX_COUNT_PER_ITEM
const MAX_NEW_ITENS = 5

exports.getDescriptions = async (userId) => {
	const winnerDescriptions = await db
		.find(descriptionModel, {
			userId: userId,
		})
		.sort({ count: -1, lastUpdate: -1 })
		.limit(MAX_WIN_ITENS)

	const newestDescriptions = await db
		.find(descriptionModel, {
			userId: userId,
		})
		.sort({ lastUpdate: -1 })
		.limit(MAX_NEW_ITENS)

	const descriptions = new Set()
	winnerDescriptions.forEach((d) => descriptions.add(d.name))
	newestDescriptions.forEach((d) => descriptions.add(d.name))

	const response = [...descriptions].sort((a, b) => a.localeCompare(b))

	return utils.makeResponse(200, 'Últimas descrições', response)
}

exports.createDescription = async (userId, descriptionName) => {
	if (!descriptionName) return

	const currentDescription = await db.findOne(descriptionModel, {
		userId: userId,
		name: descriptionName,
	})

	if (isEmpty(currentDescription)) {
		const descriptionToSave = new descriptionModel({
			userId: userId,
			name: descriptionName,
			createdAt: utils.actualDateToBataBase(),
			lastUpdate: utils.actualDateToBataBase(),
			count: 0,
			isActive: true,
		})

		await db.save(descriptionToSave)
	} else {
		const descriptions = await db
			.find(descriptionModel, {
				userId: userId,
				count: { $gt: 0 },
			})
			.sort({ count: -1 })
			.limit(MAX_WIN_ITENS)

		const totalCount = descriptions.reduce((acc, d) => acc + d.count, 0)

		if (totalCount >= MAX_TOTAL_COUNT) {
			const oldestDescription = descriptions.sort(
				(a, b) =>
					new Date(a.lastUpdate).getTime() - new Date(b.lastUpdate).getTime()
			)[0]

			await descriptionModel.findOneAndUpdate(
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

		const response = await descriptionModel.findOneAndUpdate(
			{ name: descriptionName },
			{ ...contUpdate, lastUpdate: utils.actualDateToBataBase() }
		)

		return utils.makeResponse(201, 'Descrição cadastrada com sucesso!', response)
	}
}
