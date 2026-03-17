const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getQuestoes = async (req, res) => {
    try {
        const questoes = await prisma.questoes.findMany({
            include: {
                dimensoes: {
                    include: {
                        eixos: true, // Inclui informações do eixo associado
                    },
                },
                Questoes_categorias: {
                    include: {
                        categorias: true, // Inclui as categorias associadas
                    },
                },
                questoes_modalidades: {
                    include: {
                        modalidades: true, // Inclui as modalidades associadas
                    },
                },
                tipo_questao: true, // Inclui o tipo de questão
                questoes_adicionais: true, // Inclui as questões adicionais
            },
            orderBy: {
                id: 'desc',
            },
        });

        const formattedQuestoes = questoes.map((questao) => ({
            id: questao.id,
            descricao: questao.descricao,
            basica: questao.basica,
            tipo: questao.tipo_questao?.descricao || 'Não informado',
            idPadraoResposta: questao.id_padrao_resposta,
            dimensao: {
                nome: questao.dimensoes?.nome || 'Não informado',
                numero: questao.dimensoes?.numero || 'Não informado',
                eixo: {
                    nome: questao.dimensoes?.eixos?.nome || 'Não informado',
                    numero: questao.dimensoes?.eixos?.numero || 'Não informado',
                },
            },
            categorias: questao.Questoes_categorias.map((qc) => ({
                id: qc.categorias.id,
                nome: qc.categorias.nome,
            })),
            modalidades: questao.questoes_modalidades.map((qm) => ({
                id: qm.modalidades.id,
                nome: qm.modalidades.mod_ensino,
            })),
            // Retorna as questões adicionais (array de objetos com "descricao")
            questoesAdicionais: questao.questoes_adicionais,
        }));

        res.json(formattedQuestoes);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar questões.', details: err.message });
    }
};


const postQuestoes = async (req, res) => {
    try {
        const {
            questao,
            dimensaoNumero,
            categorias,
            modalidades,
            padraoRespostaId,
            basica,
            tipo_questao,
            questoesAdicionais
        } = req.body;

        // Validação: Padrão de resposta é obrigatório
        if (!padraoRespostaId) {
            return res.status(400).json({ error: "Padrão de resposta é obrigatório." });
        }

        // Processamento das categorias:
        // Se o valor for numérico (ou string numérica), usamos como ID; caso contrário, buscamos pelo nome
        const categoriaIds = await Promise.all(
            categorias.map(async (catInput) => {
                if (typeof catInput === 'number' || /^\d+$/.test(catInput)) {
                    return parseInt(catInput, 10);
                } else {
                    const categoriaNormalized = catInput.toLowerCase();
                    const categoria = await prisma.categorias.findFirst({
                        where: {
                            nome: {
                                equals: categoriaNormalized,
                                mode: 'insensitive',
                            },
                        },
                    });
                    if (!categoria) {
                        throw new Error(`Categoria não encontrada: ${catInput}`);
                    }
                    return categoria.id;
                }
            })
        );

        // Processamento das modalidades (assumindo que são enviados como IDs)
        const modalidadeIds = await Promise.all(
            modalidades.map(async (modalidadeId) => {
                const modalidadeIdInt = parseInt(modalidadeId, 10);
                if (isNaN(modalidadeIdInt)) {
                    throw new Error(`ID de modalidade inválido: ${modalidadeId}`);
                }
                const modalidadeFound = await prisma.modalidades.findUnique({
                    where: { id: modalidadeIdInt },
                });
                if (!modalidadeFound) {
                    throw new Error(`Modalidade não encontrada: ${modalidadeIdInt}`);
                }
                return modalidadeFound.id;
            })
        );

        // Se questoesAdicionais não for array, define como array vazio.
        const questoesAdicionaisArray = Array.isArray(questoesAdicionais) ? questoesAdicionais : [];

        // Criação da nova questão
        const newQuestao = await prisma.questoes.create({
            data: {
                descricao: questao,
                tipo_questao: {
                    connect: { id: parseInt(tipo_questao, 10) },
                },
                basica,
                padrao_resposta: {
                    connect: { id: parseInt(padraoRespostaId, 10) },
                },
                questoes_adicionais: {
                    create: questoesAdicionaisArray,
                },
                dimensoes: {
                    connect: { numero: parseInt(dimensaoNumero, 10) },
                },
                // Cria os registros na tabela de relação entre questão e categorias
                Questoes_categorias: {
                    create: categoriaIds.map(categoriaId => ({
                        id_categorias: categoriaId,
                    })),
                },
                // Cria os registros na tabela de relação entre questão e modalidades
                questoes_modalidades: {
                    create: modalidadeIds.map(modalidadeId => ({
                        id_modalidades: modalidadeId,
                    })),
                },
            },
        });

        res.status(201).json({ message: 'Questão criada com sucesso!', questao: newQuestao });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar questão', details: error.message });
    }
};



const updateQuestoes = async (req, res) => {
    const { id } = req.params;
    const { questao, dimensaoNumero, categorias, modalidades, padraoRespostaId, basica, tipo_questao } = req.body;

    try {
        const existingQuestao = await prisma.questoes.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingQuestao) {
            return res.status(404).json({ message: 'Questão não encontrada.' });
        }

        const updatedQuestao = await prisma.questoes.update({
            where: { id: parseInt(id) },
            data: {
                descricao: questao,
                basica,
                tipo_questao: { connect: { id: parseInt(tipo_questao) } },  // Atualiza o tipo de questão
                padrao_resposta: { connect: { id: parseInt(padraoRespostaId) } },
                dimensao: { connect: { numero: parseInt(dimensaoNumero) } },
                Questoes_categorias: {
                    deleteMany: { id_questoes: parseInt(id) },
                    create: categorias.map((categoriaId) => ({
                        id_categorias: categoriaId,
                    })),
                },
                questoes_modalidades: {
                    deleteMany: { id_questoes: parseInt(id) },
                    create: modalidades.map((modalidadeId) => ({
                        id_modalidades: modalidadeId,
                    })),
                },
            },
        });

        res.status(200).json({ message: 'Questão atualizada com sucesso!', questao: updatedQuestao });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar questão', details: error.message });
    }
};

const deleteQuestoes = async (req, res) => {
    const { id } = req.params;

    try {
        const questao = await prisma.questoes.findUnique({
            where: { id: parseInt(id) },
        });

        if (!questao) {
            return res.status(404).json({ message: 'Questão não encontrada.' });
        }

        await prisma.questoes.delete({
            where: { id: parseInt(id) },
        });

        res.status(200).json({ message: 'Questão deletada com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar a questão.', details: error.message });
    }
};

const getQuestaoById = async (req, res) => {
    const { id } = req.params;

    try {
        const questao = await prisma.questoes.findUnique({
            where: { id: parseInt(id) },
            include: {
                Questoes_categorias: {
                    include: {
                        categorias: true,
                    },
                },
                questoes_modalidades: {
                    include: {
                        modalidades: true,
                    },
                },
                dimensoes: {
                    include: {
                        eixos: true,
                    },
                },
                tipo_questao: true,
                questoes_adicionais: true, // Inclui as questões adicionais
            },
        });

        if (!questao) {
            return res.status(404).json({ message: 'Questão não encontrada.' });
        }

        res.json({
            id: questao.id,
            descricao: questao.descricao,
            basica: questao.basica,
            tipo: questao.tipo_questao?.descricao || 'Não informado',
            idPadraoResposta: questao.id_padrao_resposta,
            dimensao: {
                nome: questao.dimensoes?.nome || 'Não informado',
                numero: questao.dimensoes?.numero || 'Não informado',
                eixo: {
                    nome: questao.dimensoes?.eixos?.nome || 'Não informado',
                    numero: questao.dimensoes?.eixos?.numero || 'Não informado',
                },
            },
            categorias: questao.Questoes_categorias.map((qc) => ({
                id: qc.categorias.id,
                nome: qc.categorias.nome,
            })),
            modalidades: questao.questoes_modalidades.map((qm) => ({
                id: qm.modalidades.id,
                nome: qm.modalidades.mod_ensino,
            })),
            // Inclui as questões adicionais
            questoesAdicionais: questao.questoes_adicionais,
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar a questão.', details: error.message });
    }
};


module.exports = {
    getQuestoes,
    postQuestoes,
    deleteQuestoes,
    updateQuestoes,
    getQuestaoById,
};
