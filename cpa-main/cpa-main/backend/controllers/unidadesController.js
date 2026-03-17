const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Listar todas as unidades
const getUnidades = async (req, res) => {
    try {
        const unidades = await prisma.unidades.findMany({
            select: {
                id: true,
                nome: true,
                sigla: true,
                municipio_vinculo: true,
            },
            orderBy: {
                id: 'asc'
            }
        });
        res.json(unidades);
    } catch (error) {
        console.error('Erro ao buscar unidades:', error);
        res.status(500).json({ error: 'Erro ao buscar unidades.' });
    }
};

const getUnidadeById = async (req, res) => {
    const { id } = req.params; // Extrai o ID da URL

    console.log('ID recebido:', id); // Log do ID recebido

    // Verifica se o ID é um número válido
    if (isNaN(id)) {
        console.log('ID inválido recebido:', id); // Log do ID inválido
        return res.status(400).json({ message: 'ID inválido. Deve ser um número.' });
    }

    try {
        const unidade = await prisma.unidades.findUnique({
            where: { id: parseInt(id) }, // Converte o ID para um número
            select: {
                id: true,
                nome: true,
                sigla: true,
                municipio_vinculo: true,
            }
        });

        console.log('Unidade encontrada:', unidade); // Log da unidade encontrada

        if (!unidade) {
            console.log('Unidade não encontrada para o ID:', id); // Log se a unidade não for encontrada
            return res.status(404).json({ message: 'Unidade não encontrada.' });
        }
        res.json(unidade);
    } catch (error) {
        console.error('Erro ao buscar unidade:', error);
        res.status(500).json({ error: 'Erro ao buscar unidade.' });
    }
};



const getUnidadesByMunicipios = async (req, res) => {
    // Captura a lista de municípios da query string
    const { municipiosNomes } = req.query;

    // Verifica se o parâmetro `municipiosNomes` foi passado
    if (!municipiosNomes) {
        return res.status(400).json({ message: "É necessário fornecer pelo menos um nome de município." });
    }

    // Divide a string `municipiosNomes` por vírgula e remove espaços extras
    const municipiosArray = municipiosNomes.split(',').map(nome => nome.trim());

    try {
        // Busca as unidades que pertencem a qualquer um dos municípios na lista
        const unidades = await prisma.unidades.findMany({
            where: {
                municipio_vinculo: {
                    in: municipiosArray
                }
            },
            select: {
                id: true,
                nome: true,
                sigla: true,
                municipio_vinculo: true,
            }
        });

        // Verifica se alguma unidade foi encontrada
        if (unidades.length === 0) {
            return res.status(404).json({ message: 'Nenhuma unidade encontrada para os municípios fornecidos.' });
        }

        // Retorna a lista de unidades encontradas
        res.json(unidades);
    } catch (error) {
        console.error('Erro ao buscar unidades por municípios:', error);
        res.status(500).json({ error: 'Erro ao buscar unidades por municípios.' });
    }
};



module.exports = {
    getUnidades,
    getUnidadeById,
    getUnidadesByMunicipios // Exclua a referência a getUnidadesByMunicipio
};
