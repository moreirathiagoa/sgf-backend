const DB_USERNAME = process.env.DB_USERNAME
const DB_PASSWORD = process.env.DB_PASSWORD
const DATA_BASE = process.env.DATA_BASE || 'test'

const URI_DATABASE = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@sgfcluster-nrl0f.gcp.mongodb.net/${DATA_BASE}?retryWrites=true&w=majority`

module.exports = {
    URI_DATABASE
}