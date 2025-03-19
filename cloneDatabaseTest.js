require('dotenv').config()
const { exec } = require('child_process')

const DB_USERNAME = process.env.DB_USERNAME
const DB_PASSWORD = process.env.DB_PASSWORD
//TODO: Jogar essas variáveis para env do projeto e usar no arquivo properties
const DB_PRD_HOST = `sgfcluster-shard-00-01.nrl0f.mongodb.net`
const DB_PRD_PORT = `27017`
const DB_PRD_AUTHENTICATION = `admin`
const DB_HML_HOST = `sgfcluster-shard-00-02.nrl0f.mongodb.net`
const DB_HML_PORT = `27017`
const DB_HML_AUTHENTICATION = `admin`

const commands = {
	backupPrd: `mongodump -h ${DB_PRD_HOST}:${DB_PRD_PORT} --ssl -u ${DB_USERNAME} -p ${DB_PASSWORD} --authenticationDatabase ${DB_PRD_AUTHENTICATION} -d sgf`,
	restoreHml: `mongorestore -h ${DB_HML_HOST}:${DB_HML_PORT} --ssl -u ${DB_USERNAME} -p ${DB_PASSWORD} --authenticationDatabase ${DB_HML_AUTHENTICATION} -d test dump/sgf --drop`,
	restorePrd: `mongorestore -h ${DB_HML_HOST}:${DB_HML_PORT} --ssl -u ${DB_USERNAME} -p ${DB_PASSWORD} --authenticationDatabase ${DB_HML_AUTHENTICATION} -d sgf dump/sgf --drop`,
}

main()

async function main() {
	try {
		console.log('Iniciando processo de backup de PRODUÇÃO')
		await runCommand(commands.backupPrd)

		console.log('Iniciando restore em HOMOLOGAÇÃO')
		await runCommand(commands.restoreHml)

		//console.log('Iniciando restore em PRODUÇÃO')
		//await runCommand(commands.restorePrd)
	} catch (error) {
		console.error('Erro durante o processo:', error)
	}
}

function runCommand(command) {
	return new Promise((resolve, reject) => {
		exec(command, { cwd: __dirname }, (err, stdout, stderr) => {
			if (err) {
				console.error(`Erro na execução: ${err.message}`)
				reject(err)
				return
			}
			if (stderr) {
				console.warn(`${stderr}`)
			}
			console.log(`Sucesso na execução!`)
			resolve(stdout)
		})
	})
}
