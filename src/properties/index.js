require('dotenv').config()
const environment = process.env.NODE_ENV || 'dev'
const applicationPort = process.env.PORT || 4000
const applicationName = 'SGF'
const keyToken = process.env.KEY_TOKEN
const dbUserName = process.env.DB_USERNAME
const dbPassword = process.env.DB_PASSWORD
const dbUrl = 'sgfcluster-nrl0f.mongodb.net'
const dbParams = 'retryWrites=true&w=majority'
const dbDevName = 'test'
const dbPrdName = 'sgf'
const definitions = {
	dev: {
		APPLICATION: applicationName,
		ENV: 'development',
		PORT: applicationPort,
		URI_DATABASE: `mongodb+srv://${dbUserName}:${dbPassword}@${dbUrl}/${dbDevName}?${dbParams}`,
		KEY_TOKEN: keyToken,
	},
	hml: {
		APPLICATION: applicationName,
		ENV: 'homologation',
		PORT: applicationPort,
		URI_DATABASE: `mongodb+srv://${dbUserName}:${dbPassword}@${dbUrl}/${dbDevName}?${dbParams}`,
		KEY_TOKEN: keyToken,
	},
	prd: {
		APPLICATION: applicationName,
		ENV: 'production',
		PORT: applicationPort,
		URI_DATABASE: `mongodb+srv://${dbUserName}:${dbPassword}@${dbUrl}/${dbPrdName}?${dbParams}`,
		KEY_TOKEN: keyToken,
	},
}

module.exports = definitions[environment]
