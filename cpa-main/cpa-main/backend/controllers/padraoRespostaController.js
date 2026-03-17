const express = require('express');
const router = express.Router();
const pool = require('../database');

//padrão de resposta
const getPadraoResposta = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, sigla
            FROM "Padrao_resposta"
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({error: 'Erro ao buscar padrão de resposta.'});
    }
};

const getPadraoRespostaById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT id, sigla
            FROM "Padrao_resposta"
            WHERE id = $1
            LIMIT 1
        `, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Padrão de resposta não encontrado.' });
        }
        res.json(result.rows[0]);
        
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar padrão de resposta.' });
    }
};

const postPadraoResposta = async (req, res) => {
    try {
        const { sigla, alternativas } = req.body;

        if (!sigla || sigla.length === 0) {
            return res.status(400).json({ error: 'O campo sigla é obrigatório e não pode ser nulo.' });
        }

        // Inicia a transação
        await pool.query('BEGIN');

        // Verifica se já existe um padrão de resposta com a mesma sigla
        const padraoExists = await pool.query('SELECT id FROM "Padrao_resposta" WHERE sigla = $1', [sigla]);
        if (padraoExists.rowCount > 0) {
            await pool.query('ROLLBACK');
            return res.status(400).json({ error: 'Padrão de resposta já existe.' });
        }

        // Insere o novo padrão de resposta
        const result = await pool.query(
            'INSERT INTO "Padrao_resposta" (sigla) VALUES ($1) RETURNING id',
            [sigla]
        );
        const padraoRespostaId = result.rows[0].id;

        // Insere cada alternativa, vinculando ao padrão de resposta
        for (const alternativa of alternativas) {
            const { descricao: descricaoAlternativa } = alternativa;
            if (descricaoAlternativa && descricaoAlternativa.trim()) {
 
                await pool.query(
                    'INSERT INTO "Alternativas" (descricao, id_padrao_resp) VALUES ($1, $2)',
                    [descricaoAlternativa, padraoRespostaId]
                );
                
            }
        }

        // Commit da transação
        await pool.query('COMMIT');
        res.status(200).json({ message: 'Padrão de resposta e alternativas cadastrados com sucesso.' });

    } catch (err) {
        console.error('Erro ao cadastrar padrão de resposta:', err);
        await pool.query('ROLLBACK');
        res.status(500).json({ error: 'Erro ao cadastrar padrão de resposta.' });
    }
};


const putPadraoResposta = async (req, res) => {
    try {
        const { id } = req.params;
        const { sigla } = req.body;
        
        // Atualiza o registro e captura o resultado
        const result = await pool.query(
            'UPDATE "Padrao_resposta" SET sigla = $1 WHERE id = $2 RETURNING id', 
            [sigla, id]
        );
        
        // Retorna o ID do registro atualizado
        res.json( {message: 'Padrão de resposta atualizado!'});
        
    } catch (err) {
        console.error('Erro ao atualizar padrão de resposta:', err);
        res.status(500).json({ error: 'Erro ao atualizar padrão de resposta.' });
    }
};

const deletePadraoResposta = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Deleta o registro e captura o resultado
        const result = await pool.query(
            'DELETE FROM "Padrao_resposta" WHERE id = $1', 
            [id]
        );
        
        // Retorna o ID do registro deletado
        res.json( {message:'Padrão de resposta excluído!'});
        
    } catch (err) {
        console.error('Erro ao excluir padrão de resposta:', err);
        res.status(500).json({ error: 'Erro ao excluir padrão de resposta.' });
    }
};

module.exports = {
    getPadraoResposta,
    getPadraoRespostaById,
    postPadraoResposta,
    putPadraoResposta,
    deletePadraoResposta
};
