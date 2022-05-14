const serverlessExpress = require('@vendia/serverless-express')
const app = require('./src/app')
const db = require('./src/database')

exports.handler = () => {
	serverlessExpress({ app })
	db.mongoose.connection.close()
}
