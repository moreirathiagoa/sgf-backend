const serverlessExpress = require('@vendia/serverless-express')
const app = require('./src/app')
const db = require('./src/database')

exports.handler = async () => {
	const response = await serverlessExpress({ app })
	db.mongoose.connection.close()
	return response
}
