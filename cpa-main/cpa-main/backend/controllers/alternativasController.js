const express = require('express');
const router = express.Router();
const pool = require('../database');

const getAlternativas = async (req, res) =>{
    try {
        const result = await pool.query(`
            SELECT id, descricao, id_padrao_resp
            FROM "Alternativas"
            ORDER BY id ASC`);
            res.json(result.rows);
            
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message:'Erro ao carregar alternativas.'});
    }
}

const getAlternativaById = async (req, res) =>{
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT id, descricao, id_padrao_resp
            FROM "Alternativas"
            WHERE id = $1
            LIMIT 1
        `, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Alternativa não encontrada.'});
        }
        res.json(result.rows[0]);
        
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar alternativa.' });
    }
};
const getAlternativasByPadraoRespostaId = async (req, res) =>{
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT id, descricao, id_padrao_resp
            FROM "Alternativas"
            WHERE id_padrao_resp = $1
            ORDER BY id ASC`, [id]);
        res.json(result.rows);
        
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar alternativas.' });
    }
};
const postAlternativas = async (req, res) =>{
    try {
        const { descricao, id_padrao_resp } = req.body;
        const result = await pool.query(`
            INSERT INTO "Alternativas" (descricao, id_padrao_resp)
            VALUES ($1, $2)
            RETURNING *`, [descricao, id_padrao_resp]);
            res.json(result.rows[0]);
            
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message:'Erro ao cadastrar alternativa.'});
    }
};

const putAlternativas = async (req, res) =>{
    try {
        const { id } = req.params;
        const { descricao, id_padrao_resp } = req.body;
        const result = await pool.query(`
            UPDATE "Alternativas"
            SET descricao=$1, id_padrao_resp=$2
            WHERE id=$3
            RETURNING *`, [descricao, id_padrao_resp, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Alternativa não encontrada.'});
        }
        res.json({ message: 'Alternativa atualizada.'});
        
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message:'Erro ao atualizar alternativa.'});
    }
};

const deleteAlternativas = async (req, res) =>{
    try {
        const { id } = req.params;
        const result = await pool.query(`
            DELETE FROM "Alternativas"
            WHERE id=$1
            RETURNING *`, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Alternativa não encontrada.'});
        }
        res.json({ message: 'Alternativa deletada.'});
        
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message:'Erro ao deletar alternativa.'});
    }
};

module.exports = {
    getAlternativas,
    postAlternativas,
    getAlternativaById,
    putAlternativas,
    deleteAlternativas,
    getAlternativasByPadraoRespostaId
};