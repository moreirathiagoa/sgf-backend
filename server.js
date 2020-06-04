const dotenv = require('dotenv')
dotenv.config()

const port = process.env.PORT || 47807
const app = require('./src/app')
const dbConnection = require('./src/database')

app.listen(port, () => {
	console.log(`Server is running at port: ${port}`)
})
