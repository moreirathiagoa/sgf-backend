const env = process.env.NODE_ENV || 'dev'

const properties = () => {

    let KEY_TOKEN
    let DB_USERNAME
    let DB_PASSWORD

    switch (env) {
        case 'dev':
            KEY_TOKEN = process.env.KEY_TOKEN
            DB_USERNAME = process.env.DB_USERNAME
            DB_PASSWORD = process.env.DB_PASSWORD
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
