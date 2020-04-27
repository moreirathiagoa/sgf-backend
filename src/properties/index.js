const env = process.env.NODE_ENV || 'dev'

const properties = () => {

    let KEY_TOKEN
    let DB_USERNAME
    let DB_PASSWORD
    let DEFAULT_USER
    let DEFAULT_PASSWORD

    switch (env) {
        case 'dev':
            KEY_TOKEN = process.env.KEY_TOKEN
            DB_USERNAME = process.env.DB_USERNAME
            DB_PASSWORD = process.env.DB_PASSWORD
            DEFAULT_USER = process.env.DEFAULT_USER
            DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD
            DATA_BASE = 'test'
            return {
                uriDataBase: `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@sgfcluster-nrl0f.mongodb.net/${DATA_BASE}?retryWrites=true&w=majority`,
                keyToken: KEY_TOKEN,
                defaultUserName: DEFAULT_USER,
                defaultUserPassword: DEFAULT_PASSWORD
            }
        
        case 'prod':
            KEY_TOKEN = process.env.KEY_TOKEN
            DB_USERNAME = process.env.DB_USERNAME
            DB_PASSWORD = process.env.DB_PASSWORD
            DATA_BASE = process.env.DATA_BASE
            DEFAULT_USER = process.env.DEFAULT_USER
            DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD
            return {
                uriDataBase: `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@sgfcluster-nrl0f.mongodb.net/${DATA_BASE}?retryWrites=true&w=majority`,
                keyToken: KEY_TOKEN,
                defaultUserName: DEFAULT_USER,
                defaultUserPassword: DEFAULT_PASSWORD
            }
    }
}
console.log ('Iniciado em ambiente ' + env.toLocaleUpperCase())

module.exports = properties()
