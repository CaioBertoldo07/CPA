// controllers/cursosController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Endpoint para buscar cursos por modalidades
exports.getCursosByModalidade = async (req, res) => {
    const { modalidadeIds } = req.query;

    if (!modalidadeIds) {
        return res.status(400).json({ message: "É necessário fornecer pelo menos um ID de modalidade." });
    }

    // Convertendo os IDs de modalidades fornecidos em um array de números
    const modalidadeIdsArray = modalidadeIds.split(',').map(id => parseInt(id.trim()));

    if (modalidadeIdsArray.length === 0 || modalidadeIdsArray.some(id => isNaN(id))) {
        return res.status(400).json({ message: "IDs de modalidades inválidos fornecidos." });
    }

    try {
        // Consultando os cursos com base nos IDs das modalidades
        const cursos = await prisma.cursos.findMany({
            where: {
                modalidade: {
                    in: modalidadeIdsArray,
                },
            },
            select: {
                id: true,
                identificador_api_lyceum: true,
                nome: true,
                nivel: true,
                modalidade: true,
                modalidade_api: true
            },
        });

        if (cursos.length > 0) {
            res.status(200).json(cursos);
        } else {
            res.status(404).json({ message: 'Nenhum curso encontrado para as modalidades fornecidas' });
        }
    } catch (error) {
        console.error("Erro ao buscar cursos por modalidade:", error);
        res.status(500).json({ error: "Erro ao carregar cursos por modalidade" });
    }
};
// Endpoint para buscar cursos por unidades
exports.getCursosByUnidadesIds = async (req, res) => {
    const { unidadeIds } = req.query;

    if (!unidadeIds) {
        return res.status(400).json({ message: "É necessário fornecer pelo menos um ID de unidade." });
    }

    const unidadeIdsArray = unidadeIds.split(',').map(id => parseInt(id.trim()));

    if (unidadeIdsArray.length === 0 || unidadeIdsArray.some(id => isNaN(id))) {
        return res.status(400).json({ message: "IDs de unidades inválidos fornecidos." });
    }

    try {
        const cursos = await prisma.cursos.findMany({
            where: {
                id_unidades: {
                    in: unidadeIdsArray,
                },
            },
            select: {
                id: true,
                identificador_api_lyceum: true,
                nome: true,
                nivel: true,
                modalidade: true,
                modalidade_api: true
            },
        });

        // ← ANTES: retornava 404 quando vazio — axios jogava no catch
        // ← AGORA: sempre retorna 200 com array (vazio ou não)
        res.status(200).json(cursos);
    } catch (error) {
        console.error("Erro ao buscar cursos:", error);
        res.status(500).json({ error: "Erro ao carregar cursos" });
    }
};

// Endpoint para buscar todos os cursos
exports.getTodosCursos = async (req, res) => {
    try {
        const cursos = await prisma.cursos.findMany({
            select: {
                id: true,
                identificador_api_lyceum: true,
                nome: true,
                nivel: true,
                modalidade: true,
                modalidade_api: true
            },
        });

        // ← mesmo fix
        res.status(200).json(cursos);
    } catch (error) {
        console.error("Erro ao buscar todos os cursos:", error);
        res.status(500).json({ error: "Erro ao carregar todos os cursos" });
    }
};
