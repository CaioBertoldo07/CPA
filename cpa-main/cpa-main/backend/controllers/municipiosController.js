const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Listar todos os municípios
const getMunicipios = async (req, res) => {
    try {
        const municipios = await prisma.municipios.findMany({
            select: {
                id: true,
                nome: true,
                UF: true,
            },
            orderBy: {
                id: 'asc'
            }
        });
        res.json(municipios);
    } catch (error) {
        console.error('Erro ao buscar municípios:', error);
        res.status(500).json({ error: 'Erro ao buscar municípios.' });
    }
};

// Buscar município específico pelo ID
const getMunicipioById = async (req, res) => {
    const { id } = req.params;

    try {
        const municipio = await prisma.municipios.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,
                nome: true,
                UF: true,
            }
        });

        if (!municipio) {
            return res.status(404).json({ message: 'Município não encontrado.' });
        }
        res.json(municipio);
    } catch (error) {
        console.error('Erro ao buscar município:', error);
        res.status(500).json({ error: 'Erro ao buscar município.' });
    }
};

module.exports = {
    getMunicipios,
    getMunicipioById
};
