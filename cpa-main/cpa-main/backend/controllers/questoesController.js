const questoesRepository = require('../repositories/questoesRepository');
const prisma = require('../repositories/prismaClient');

const getQuestoes = async (req, res) => {
    try {
        const questoes = await questoesRepository.findMany();

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

        if (!padraoRespostaId) {
            return res.status(400).json({ error: "Padrão de resposta é obrigatório." });
        }

        const categoriaIds = await Promise.all(
            categorias.map(async (catInput) => {
                if (typeof catInput === 'number' || /^\d+$/.test(catInput)) {
                    return parseInt(catInput, 10);
                } else {
                    const categoria = await prisma.categorias.findFirst({
                        where: { nome: { equals: catInput.toLowerCase(), mode: 'insensitive' } },
                    });
                    if (!categoria) throw new Error(`Categoria não encontrada: ${catInput}`);
                    return categoria.id;
                }
            })
        );

        const modalidadeIds = await Promise.all(
            modalidades.map(async (modalidadeId) => {
                const modalidadeIdInt = parseInt(modalidadeId, 10);
                if (isNaN(modalidadeIdInt)) throw new Error(`ID de modalidade inválido: ${modalidadeId}`);
                const modalidadeFound = await prisma.modalidades.findUnique({ where: { id: modalidadeIdInt } });
                if (!modalidadeFound) throw new Error(`Modalidade não encontrada: ${modalidadeIdInt}`);
                return modalidadeFound.id;
            })
        );

        const questoesAdicionaisArray = Array.isArray(questoesAdicionais) ? questoesAdicionais : [];

        const newQuestao = await questoesRepository.create({
            descricao: questao,
            tipo_questao: { connect: { id: parseInt(tipo_questao, 10) } },
            basica,
            padrao_resposta: { connect: { id: parseInt(padraoRespostaId, 10) } },
            questoes_adicionais: { create: questoesAdicionaisArray },
            dimensoes: { connect: { numero: parseInt(dimensaoNumero, 10) } },
            Questoes_categorias: {
                create: categoriaIds.map(categoriaId => ({ id_categorias: categoriaId })),
            },
            questoes_modalidades: {
                create: modalidadeIds.map(modalidadeId => ({ id_modalidades: modalidadeId })),
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
        const existingQuestao = await questoesRepository.findUniqueById(parseInt(id));
        if (!existingQuestao) {
            return res.status(404).json({ message: 'Questão não encontrada.' });
        }

        const updatedQuestao = await questoesRepository.update(parseInt(id), {
            descricao: questao,
            basica,
            tipo_questao: { connect: { id: parseInt(tipo_questao) } },
            padrao_resposta: { connect: { id: parseInt(padraoRespostaId) } },
            dimensoes: { connect: { numero: parseInt(dimensaoNumero) } },
            Questoes_categorias: {
                deleteMany: { id_questoes: parseInt(id) },
                create: categorias.map((categoriaId) => ({ id_categorias: categoriaId })),
            },
            questoes_modalidades: {
                deleteMany: { id_questoes: parseInt(id) },
                create: modalidades.map((modalidadeId) => ({ id_modalidades: modalidadeId })),
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
        const questao = await questoesRepository.findUniqueById(parseInt(id));
        if (!questao) {
            return res.status(404).json({ message: 'Questão não encontrada.' });
        }

        await questoesRepository.remove(parseInt(id));
        res.status(200).json({ message: 'Questão deletada com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar a questão.', details: error.message });
    }
};

const getQuestaoById = async (req, res) => {
    const { id } = req.params;

    try {
        const questao = await questoesRepository.findById(parseInt(id));

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
