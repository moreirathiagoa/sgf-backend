require('dotenv').config()
const ENV = process.env.NODE_ENV || 'prd'
const PORT = process.env.PORT || 4000
const APPLICATION = 'SGF'

console.log('ENV: ', ENV);
const base = {
	APPLICATION,
	ENV,
	PORT,
}

const properties = () => {
	let KEY_TOKEN, DB_USERNAME, DB_PASSWORD, DB_URL, DB_PARAMS

	switch (ENV) {
		case 'dev':
			KEY_TOKEN = process.env.KEY_TOKEN
			DB_USERNAME = process.env.DB_USERNAME
			DB_PASSWORD = process.env.DB_PASSWORD
			DB_URL = 'sgfcluster-nrl0f.mongodb.net'
			DB_PARAMS = 'retryWrites=true&w=majority'
			DATA_BASE = 'test'

			return {
				...base,
				uriDataBase: `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${DB_URL}/${DATA_BASE}?${DB_PARAMS}`,
				keyToken: KEY_TOKEN,
			}

		case 'prd':
			KEY_TOKEN = process.env.KEY_TOKEN
			DB_USERNAME = process.env.DB_USERNAME
			DB_PASSWORD = process.env.DB_PASSWORD
			DB_URL = 'sgfcluster-nrl0f.mongodb.net'
			DB_PARAMS = 'retryWrites=true&w=majority'
			DATA_BASE = 'sgf'

			return {
				...base,
				uriDataBase: `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${DB_URL}/${DATA_BASE}?${DB_PARAMS}`,
				keyToken: KEY_TOKEN,
			}
	}
}

module.exports = properties()
