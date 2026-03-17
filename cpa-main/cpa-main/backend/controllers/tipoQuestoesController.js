// controllers/tipoQuestoesController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// ou o caminho para o seu arquivo Prisma Client

// Função para buscar todos os tipos de questões
const getTipoQuestoes = async (req, res) => {
    try {
        const tipos = await prisma.questoes_tipo.findMany(); // Ou o nome correto da tabela
        return res.status(200).json(tipos);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erro ao buscar tipos de questões", error });
    }
};

module.exports = {
    getTipoQuestoes,
};
