const pool = require("../conection")

const listCategories = async (req, res) => {

    try {
        const list = await pool.query(
            'select * from categorias'
        )

        res.status(200).json(list.rows)
    } catch (error) {
        res.status(500).json({ message: 'erro interno do servidor ' })
    }
}


module.exports = {
    listCategories
}