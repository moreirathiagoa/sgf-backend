const serverlessExpress = require('@codegenie/serverless-express')
const app = require('./src/app')

exports.handler = serverlessExpress({ app })
