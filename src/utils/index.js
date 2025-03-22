const moment = require('moment/min/moment-with-locales')

exports.actualDateToUser = () => {
	moment.locale('pt-br')
	const now = moment()
	return now.format('DD/MM/YYYY')
}

exports.actualDateTimeToUser = () => {
	moment.locale('pt-br')
	const now = moment()
	return now.format('DD/MM/YYYY HH:MM')
}

exports.actualDateToBataBase = () => {
	moment.locale('pt-br')
	const now = moment()
	return now.format()
}

exports.formatDateToSelectBox = (dateInformed) => {
	moment.locale('pt-br')
	return moment(dateInformed, 'DD/MM/YYYY')
}

exports.formatDateToUser = (dateInformed) => {
	moment.locale('pt-br')
	return moment(dateInformed).format('DD/MM/YYYY')
}

exports.formatDateTimeToUser = (dateInformed) => {
	moment.locale('pt-br')
	return moment(dateInformed).format('DD/MM/YYYY HH:MM')
}

exports.formatDateToBataBase = (dateInformed) => {
	moment.locale('pt-br')
	return moment(dateInformed).format()
}

exports.addMonth = (date, qtd) => {
	return moment(date).add(qtd, 'month')
}

exports.validateRequestedElements = (object, requested) => {
	let emptyAtributes = []
	requested.forEach((element) => {
		if (!object.hasOwnProperty(element)) {
			emptyAtributes.push(element)
		}
	})
	return emptyAtributes.join(', ')
}

exports.makeResponse = (code, message, data) => {
	return {
		code: code,
		message: message,
		data: data,
	}
}

exports.isNumeric = (n) => {
	return !isNaN(parseFloat(n)) && isFinite(n)
}
