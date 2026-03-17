const pool = require('../database');
const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();

const getCategorias = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, nome, data_criacao
            FROM "Categorias"
            ORDER BY id DESC`
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({error: 'Erro ao buscar categorias.'});
    }
};

const postCategorias = async (req, res) => {
    try {
        const { nome } = req.body;
        const data_criacao = new Date();

        const novaCategoria = await prisma.categorias.create({
            data: {
                nome,
                data_criacao
            },
        });
        return res.status(201).json({
            message: 'Categoria cadastrada com sucesso!',
            categoria: novaCategoria,
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Erro ao cadastrar a categoria.',
            error: error.message,
        });
    }

}

const deleteCategorias = async (req, res) => {
    const { id } = req.params;

    try {
        const categoria = await prisma.categorias.findFirst({
            where: { id: Number(id) },
        });
        if (!categoria) {
            return res.status(404).json({
                message: 'Categoria não encontrada.',
            });
        }
        await prisma.categorias.delete({
            where: { id: Number(id) },
        });
        return res.status(200).json({
            message: 'Categoria deletada com sucesso!',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Erro ao deletar a categoria.',
            error: error.message,
        });
    }
};

const updateCategorias = async (req, res) => {
    const { id } = req.params;
    const { nome } = req.body;

    try {
        const categoriaExistente = await prisma.categorias.findFirst({
            where: { id: Number(id) },
        });

        if (!categoriaExistente) {
            return res.status(404).json({
                message: 'Categoria não encontrada.',
            });
        }

        const categoriaAtualizada = await prisma.categorias.update({
            where: { id: Number(id) },
            data: { nome },
        });

        return res.status(200).json({
            message: 'Categoria atualizada com sucesso!',
            categoria: categoriaAtualizada,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Erro ao atualizar a categoria.',
            error: error.message,
        });
    }
};

module.exports = {
    getCategorias,
    postCategorias,
    deleteCategorias,
    updateCategorias
};