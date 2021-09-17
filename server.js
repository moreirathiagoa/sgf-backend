const dotenv = require('dotenv')
dotenv.config()

const properties = require('./src/properties')
const port = process.env.PORT || 4000
const app = require('./src/app')
const dbConnection = require('./src/database')

dbConnection.start().catch((err) => {
	console.log(`Erro no início da aplicação: ${err}`)
	process.exit()
})

app.listen(port, () => {
	console.log(
		`Servido iniciado na porta ${port} e ambiente ${properties.env.toUpperCase()}`
	)
})
