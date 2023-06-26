const { Pool } = require('pg')

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '3457104011',
    database: 'dindin',
})

module.exports = pool