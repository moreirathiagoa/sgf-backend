const _ = require('lodash')
const moment = require('moment/min/moment-with-locales')

function actualDateToUser() {
	moment.locale('pt-br')
	const now = moment()

	const dateToUser = now.format('DD/MM/YYYY')
	return dateToUser
}

function actualDateTimeToUser() {
	moment.locale('pt-br')
	const now = moment()

	const dateTimeToUser = now.format('DD/MM/YYYY HH:MM')
	return dateTimeToUser
}

function actualDateToBataBase() {
	moment.locale('pt-br')
	const now = moment()

	const dateToDataBase = now.format()
	return dateToDataBase
}

function formatDateToSelectBox(dateInformed) {
	moment.locale('pt-br')
	const dateMoment = moment(dateInformed, 'DD/MM/YYYY')

	return dateMoment
}

function formatDateToUser(dateInformed) {
	moment.locale('pt-br')
	const dateToMoment = moment(dateInformed)

	const dateToUser = dateToMoment.format('DD/MM/YYYY')
	return dateToUser
}

function formatDateTimeToUser(dateInformed) {
	moment.locale('pt-br')
	const dateToMoment = moment(dateInformed)

	const dateTimeToUser = dateToMoment.format('DD/MM/YYYY HH:MM')
	return dateTimeToUser
}

function formatDateToBataBase(dateInformed) {
	moment.locale('pt-br')
	const dateToMoment = moment(dateInformed)

	const dateToDataBase = dateToMoment.format()
	return dateToDataBase
}

function addMonth(date, qtd) {
	return moment(date).add(qtd, 'month')
}

function validateRequestedElements(object, requireds) {
	let emptyAtributes = []
	requireds.forEach((element) => {
		if (!object.hasOwnProperty(element)) {
			emptyAtributes.push(element)
		}
	})
	return emptyAtributes.join(', ')
}

function makeResponse(code, message, data) {
	return {
		code: code,
		message: message,
		data: data,
	}
}

function isNumeric(n) {
	return !isNaN(parseFloat(n)) && isFinite(n)
}

module.exports = {
	validateRequestedElements,
	isNumeric,
	makeResponse,
	actualDateToUser,
	actualDateTimeToUser,
	actualDateToBataBase,
	formatDateToUser,
	formatDateTimeToUser,
	formatDateToBataBase,
	formatDateToSelectBox,
	addMonth,
}
