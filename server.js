const CONSTANTS = require('./src/properties')
const logger = require('./config/logger')
const app = require('./src/app')

app.listen(CONSTANTS.PORT, () => {
	logger.info({ port: CONSTANTS.PORT }, `Server started`)
})
