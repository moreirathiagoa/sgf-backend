const pino = require('pino')
const CONSTANT = require('../src/properties')

const logger = pino({
	formatters: {
		bindings() {
			return {
				application: `${CONSTANT.APPLICATION}`,
				environment: `${CONSTANT.ENV}`,
			}
		},
		level(label) {
			return {
				log_level: label.toUpperCase(),
			}
		},
	},
	timestamp: () => {
		const date = new Date()

		return `,"date":"${`${date.toLocaleString(
			'pt-BR'
		)}.${date.getMilliseconds()}`}"`
	},

	messageKey: 'log_message',
})

module.exports = logger
