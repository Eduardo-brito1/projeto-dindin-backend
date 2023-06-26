const { query } = require("express")
const pool = require("../conection")


const handleListTransactions = async (req, res) => {
    try {
        const transactions = await pool.query(
            `select 
            transacoes.id, 
            transacoes.descricao,transacoes.valor,
            transacoes.data,transacoes.categoria_id,
            transacoes.usuario_id,transacoes.tipo , categorias.descricao as categoria_nome 
            from transacoes  join categorias on transacoes.categoria_id = categorias.id  
            where  transacoes.usuario_id =$1`, [req.usuario.id]
        )
        res.status(200).json(transactions.rows)
    } catch (error) {
        console.log('esta com erro mas esta conectando ');
        res.status(500).json({ message: 'erro interno do servidor ' })
    }

}

const handleDetailTransactions = async (req, res) => {
    const { id } = req.params
    try {
        const transaction = await pool.query(
            `select 
            transacoes.id, 
            transacoes.descricao,transacoes.valor,
            transacoes.data,transacoes.categoria_id,
            transacoes.usuario_id,transacoes.tipo , categorias.descricao as categoria_nome 
            from transacoes  join categorias on transacoes.categoria_id = categorias.id  
            where transacoes.id = $1 and  transacoes.usuario_id =$2`, [id, req.usuario.id]
        )
        if (transaction.rowCount == 0) {
            return res.status(400).json({ mensagem: 'Transação não encontrada.' })
        }
        res.status(200).json(transaction.rows)
    } catch (error) {
        res.status(500).json({ message: 'erro interno do servidor ' })
    }

}

const handleRegisterTransactions = async (req, res) => {
    const { descricao, valor, data, categoria_id, tipo } = req.body;

    try {
        if (!descricao || !valor || !data || !categoria_id || !tipo) {
            return res.status(400).json({ mensagem: 'E necessario preencher todos os campos' })
        }

        if (tipo != 'entrada' && tipo != 'saida') {
            return res.status(400).json({ mensagem: 'o tipo deve ser Entrada ou Saida' })
        }
        const category = 'select * from categorias where id = $1'
        const category_exist = await pool.query(category, [categoria_id])

        if (category_exist.rowCount == 0) {
            return res.status(400).json({ mensagem: 'esta categoria não existe' })
        }

        const register = await pool.query(
            `insert into 
            transacoes 
            (descricao,valor,data,categoria_id,tipo,usuario_id) 
            values ($1, $2, $3, $4, $5,$6) returning *`,
            [descricao, valor, data, categoria_id, tipo, req.usuario.id]
        )
        const category_name = await pool.query(
            `select descricao as categoria_nome  from categorias where id = $1`, [categoria_id]
        )

        const registered = { ...register.rows[0], ...category_name.rows[0] }
        return res.status(201).json(registered)

    } catch (error) {

        res.status(500).json({ message: 'erro interno do servidor ' })

    }
}

const handleUpdateTransactions = async (req, res) => {
    const { id } = req.params
    const { descricao, valor, data, categoria_id, tipo } = req.body;

    try {
        const verifyingtransaction = 'select * from transacoes where id = $1 and usuario_id = $2'
        const idTransanction = await pool.query(verifyingtransaction
            , [id, req.usuario.id])

        if (idTransanction.rowCount == 0) {
            return res.status(400).json({ mensagem: 'essa transação nao existe' })
        }

        if (tipo != 'entrada' && tipo != 'saida') {
            return res.status(400).json({ mensagem: 'o tipo deve ser Entrada ou Saida' })
        }

        const category = 'select * from categorias where id = $1'
        const category_exist = await pool.query(category, [categoria_id])

        if (category_exist.rowCount == 0) {
            return res.status(400).json({ mensagem: 'esta categoria não existe' })
        }
        const updateTransaction = await pool.query(
            `update transacoes set 
             descricao = $1 , valor = $2 , data = $3 , categoria_id = $4 , tipo = $5
             where id = $6 and usuario_id = $7`
            , [descricao, valor, data, categoria_id, tipo, id, req.usuario.id]
        )

        return res.status(201).json(updateTransaction.rows)
    } catch (error) {

        res.status(500).json({ message: 'erro interno do servidor ' })
    }


}

const handleDeleteTransactions = async (req, res) => {

    const { id } = req.params
    try {
        const verifyId = 'select * from transacoes where id = $1 and usuario_id = $2'
        const idTransanction = await pool.query(verifyId, [id, req.usuario.id])

        if (idTransanction.rowCount == 0) {
            return res.status(400).json({ mensagem: 'essa transação nao existe' })
        }

        const DeleteTransactions = await pool.query(
            `delete  from transacoes where id =  $1 and usuario_id = $2`, [id, req.usuario.id]
        )

        return res.status(201).json(DeleteTransactions.rows)

    } catch (error) {

        res.status(500).json({ message: 'erro interno do servidor ' })

    }

}

const handleExtractTransactions = async (req, res) => {

    try {

        const entryTransactionStatement = await pool.query(
            ` select sum(valor) as entrada from transacoes where tipo = 'entrada' and usuario_id =$1 ;`, [req.usuario.id]
        )
        for (const item of entryTransactionStatement.rows) {
            if (item.entrada == null) {
                item.entrada = 0
            }
        }

        const outgoingTransactionStatement
            = await pool.query(
                ` select sum(valor) as saida from transacoes where tipo = 'saida' and usuario_id =$1;`, [req.usuario.id]
            )
        for (const item of outgoingTransactionStatement.rows) {
            if (item.saida == null) {
                item.saida = 0
            }
        }

        const extractComplete = { ...entryTransactionStatement.rows[0], ...outgoingTransactionStatement.rows[0] }

        return res.status(201).json(extractComplete)

    } catch (error) {

        res.status(500).json({ message: 'erro interno do servidor ' })
    }


}


module.exports = {
    handleListTransactions,
    handleDetailTransactions,
    handleRegisterTransactions,
    handleUpdateTransactions,
    handleDeleteTransactions,
    handleExtractTransactions
}