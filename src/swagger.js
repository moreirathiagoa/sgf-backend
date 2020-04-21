/*
    Instalando:
        npm install --save swagger-jsdoc swagger-ui-express
    
    Configurando App:
        const swaggerUi = require('swagger-ui-express')
        const specs = require('../swagger')
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))
    
    Acessando:
        http://localhost:3000/api-docs/
*/
const swaggerJsdoc = require('swagger-jsdoc');
const options = {
    apis: ['./src/routes/*.js'],
    basePath: '/',
    swaggerDefinition: {
        info: {
            description: 'Sistema de Gerenciamento Financeiro',
            version: '1.0.0',
            title: 'SGF'
        },
    },
};
const specs = swaggerJsdoc(options);

module.exports = specs;
