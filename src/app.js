const swaggerUi = require('swagger-ui-express')
const specs = require('./swagger')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const routes = require('./routes')

const app = express()
app.use(cors({origin: '*'}))


// const bcrypt = require('bcrypt')
// let entrada = 'thiago'
// let saida = bcrypt.hashSync(entrada,10)
// let verificacao = bcrypt.compareSync(entrada, saida)

// console.log('entrada',entrada)
// console.log('saida',saida)
// console.log('verificacao',verificacao)




// const jwt = require('jsonwebtoken')
// const data = {
//     data: 'Esse token foi gerado para gerar um key muito forte para uso na apliação'
// }
// const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1ODc5MDk1OTUsImV4cCI6MTU4Nzk5NTk5NX0"
// const option = { expiresIn: '1d' }
// const token = jwt.sign(data, key, option)
// console.log(token);

// jwt.verify(token, key, (err,decoded)=>{
//     console.log('decoded',decoded);
//     console.log('err',err);
// })



app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/', routes.homeRouter)
app.use('/login', routes.loginRouter)
app.use('/category', routes.categoryRouter)
app.use('/bank', routes.bankRouter)
app.use('/transaction', routes.transactionRouter)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))

module.exports = app
