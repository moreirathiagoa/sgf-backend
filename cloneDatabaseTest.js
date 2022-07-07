require('dotenv').config()
const exec = require('child_process').exec

const DB_USERNAME = process.env.DB_USERNAME
const DB_PASSWORD = process.env.DB_PASSWORD

function runCommand(cmds, cb) {
	const next = cmds.shift()

	if (!next) return cb()

	exec(next, { cwd: __dirname }, (err, stdout, stderr) => {
		console.log('Iniciando comando')

		if (err && !next.match(/\-s$/)) {
			console.log(`Falha na execução - ${err.message}`)
			cb(err)
		} else {
			console.log(`Sucesso na execução`)
			runCommand(cmds, cb)
		}
	})
}

const commands = [
	`mongodump -h sgfcluster-shard-00-01.nrl0f.mongodb.net:27017 --ssl -u ${DB_USERNAME} -p ${DB_PASSWORD} --authenticationDatabase admin -d sgf`,
	`mongorestore -h sgfcluster-shard-00-02.nrl0f.mongodb.net:27017 --ssl -u ${DB_USERNAME} -p ${DB_PASSWORD} --authenticationDatabase admin -d test dump/sgf --drop`,
]

runCommand(commands, (err) => {
	console.log('Script finalizado')
})
