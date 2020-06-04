const dotenv = require('dotenv')
dotenv.config()

const port = process.env.PORT || 8989896
const app = require('./src/app')
const dbConnection = require('./src/database')

app.listen(port, () => {
	console.log(`Server is running at port: ${port}`)
})
