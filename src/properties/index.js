const env = process.env.NODE_ENV || 'dev'

const properties = () => {

    let KEY_TOKEN, DB_USERNAME, DB_PASSWORD, DB_URL, DB_PARAMS, DB_PORT

    switch (env) {
        case 'dev':
            KEY_TOKEN = process.env.KEY_TOKEN
            DB_URL = 'localhost'
            DATA_BASE = 'sgfTest'
            DB_PORT = '27017'

            return {
                uriDataBase: `mongodb://${DB_URL}:${DB_PORT}/${DATA_BASE}`,
                keyToken: KEY_TOKEN
            }

        case 'prod':
            KEY_TOKEN = process.env.KEY_TOKEN
            DB_USERNAME = process.env.DB_USERNAME
            DB_PASSWORD = process.env.DB_PASSWORD
            DB_URL = 'sgfcluster-nrl0f.mongodb.net'
            DB_PARAMS = 'retryWrites=true&w=majority'
            DATA_BASE = process.env.DATA_BASE

            return {
                uriDataBase: `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${DB_URL}/${DATA_BASE}?${DB_PARAMS}`,
                keyToken: KEY_TOKEN
            }
    }
}
console.log('Iniciado em ambiente ' + env.toLocaleUpperCase())

module.exports = properties()
