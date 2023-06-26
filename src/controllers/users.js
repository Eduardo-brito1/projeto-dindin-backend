const pool = require('../conection')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const senhaJwt = require('../Passwordjwt')

const testConexion = async (req, res) => {
    try {


        return res.status(200).json('conectado ao banco')
    } catch (error) {
        return res.status(500).json({ mensagem: 'error na conexão' })
    }
}

const handleRegisterUser = async (req, res) => {
    const { nome, email, senha } = req.body
    try {
        if (!nome || !email || !senha) {
            return res.status(400).json({ mensagem: 'E necessario preencher todos os campos' })
        }
        const passwordEncrypted = await bcrypt.hash(senha, 10)

        const storingEmail = 'select * from usuarios where email = $1'
        const checkingEmail = await pool.query(storingEmail, [email])

        if (checkingEmail.rowCount > 0) {
            return res.status(400).json({ mensagem: 'Já existe usuário cadastrado com o e-mail informado' })
        }

        const newUser = await pool.query(
            'insert into usuarios (nome, email, senha) values ($1, $2, $3) returning *',
            [nome, email, passwordEncrypted]
        )

        const usuario = {
            ...newUser.rows[0] =
            {
                id: newUser.rows[0].id,
                nome: newUser.rows[0].nome,
                email: newUser.rows[0].email
            }
        }

        return res.status(201).json(usuario)
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' })
    }
}

const Login = async (req, res) => {
    const { email, senha } = req.body
    try {
        if (!email || !senha) {
            return res.status(400).json({ mensagem: 'todos os campos devem ser preenchidos' })
        }

        const { rows, rowCount } = await pool.query('select * from usuarios where email = $1', [email])

        if (rowCount === 0) {
            return res.status(400).json({ mensagem: 'Usuário e/ou senha inválido(s).' })
        }

        const { senha: passwordUser, ...usuario } = rows[0]

        const correctPassword = await bcrypt.compare(senha, passwordUser)
        if (!correctPassword) {
            return res.status(400).json({ mensagem: 'Usuário e/ou senha inválido(s).' })
        }

        const token = jwt.sign({ id: usuario.id }, senhaJwt, { expiresIn: '8h' })

        return res.json({
            usuario, token
        })


    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' })
    }

}

const handleDetailUser = async (req, res) => {

    try {
        const { rows: usuario } = await pool.query(
            'select id, nome, email from usuarios where id = $1',
            [req.usuario.id]
        )


        return res.json(usuario)
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' })

    }

}

const handleUpdateUser = async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        if (!nome || !email || !senha) {
            return res.status(400).json({ mensagem: 'E necessario preencher todos os campos' })
        }
        const passwordEncrypted = await bcrypt.hash(senha, 10)

        const storingEmail = 'select * from usuarios where email = $1'
        const checkingEmail = await pool.query(storingEmail, [email])

        if (checkingEmail.rowCount > 0) {
            return res.status(400).json({ mensagem: 'Já existe usuário cadastrado com o e-mail informado' })
        }

        const User = await pool.query(
            'update usuarios set nome = $1 , email = $2 , senha = $3 where id = $4', [nome, email, passwordEncrypted, req.usuario.id]
        )


        return res.json(User[0])
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' })

    }


}




module.exports = {
    handleRegisterUser,
    Login,
    handleDetailUser,
    handleUpdateUser,
    testConexion
}