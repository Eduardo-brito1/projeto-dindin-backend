const express = require('express');

const routes = express();

const { listCategories } = require('./controllers/categories');

const
    { handleListTransactions,
        handleDetailTransactions,
        handleRegisterTransactions,
        handleUpdateTransactions,
        handleExtractTransactions,
        handleDeleteTransactions,
    } = require('./controllers/transactions');

const { handleRegisterUser, Login, handleDetailUser, handleUpdateUser, testConexion, } = require('./controllers/users');
const verificaLogin = require('./middlewares/verifyLogin');

routes.post('/usuario', handleRegisterUser)
routes.post('/login', Login)
routes.get('/teste', testConexion)
routes.use(verificaLogin)

routes.get('/usuario', handleDetailUser)
routes.put('/usuario', handleUpdateUser)
routes.get('/categorias', listCategories)

routes.get('/transacao', handleListTransactions)
routes.get('/transacao/extrato', handleExtractTransactions)
routes.get('/transacao/:id', handleDetailTransactions)
routes.post('/transacao', handleRegisterTransactions)
routes.put('/transacao/:id', handleUpdateTransactions)
routes.delete('/transacao/:id', handleDeleteTransactions)


module.exports = routes