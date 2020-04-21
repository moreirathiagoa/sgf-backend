//const dotenv = require('dotenv');
//dotenv.config();

const URI_DATABASE = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@sgfcluster-nrl0f.gcp.mongodb.net/test?retryWrites=true&w=majority`

module.exports = {
    URI_DATABASE
}