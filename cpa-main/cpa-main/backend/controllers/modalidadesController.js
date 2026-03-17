const express = require('express');
const router = express.Router();
const pool = require('../database'); // Certifique-se de que o arquivo `database.js` está configurado corretamente para a conexão com o banco de dados

const getModalidades = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, mod_ensino, mod_oferta , data_criacao, num_questoes
            FROM "Modalidades"
            ORDER BY id DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({error: 'Erro ao buscar eixos.'});
    }
};
const getModalidadesByNumero = async (req, res) => {
    const {id} = req.params;
    console.log('Número da modalidade recebido:', id);

    try {
        const idModalidadeInt = parseInt(id, 10);
        console.log('Número da modalidade convertido:', idModalidadeInt);

        // Corrigido de numeroEixoInt para numeroModalidadeInt
        if (isNaN(idModalidadeInt)) {
            return res.status(400).json({ message: 'Número da modalidade inválido.' });
        }

        const result = await pool.query(`
            SELECT id, mod_ensino, mod_oferta, data_criacao, num_questoes
            FROM "Modalidades"
            WHERE id = $1
        `, [idModalidadeInt]);

        console.log('Resultado da consulta:', result.rows);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Modalidade não encontrada.' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Erro ao buscar modalidade.' });
    }
};

const postModalidades = async (req, res) => {
    try {
        const { id, mod_ensino, mod_oferta } = req.body;
        const num_questoes = 10;

        // Verifica se todos os campos obrigatórios estão presentes
        if (!mod_ensino) {
            return res.status(400).json({ error: 'O campo modalidade de ensino é obrigatório.' });
        }

        // Inicia a transação
        await pool.query('BEGIN');

        // Verifica se a modalidade já existe com o mesmo código
        const modalidadeExists = await pool.query('SELECT * FROM "Modalidades" WHERE id = $1', [id]);
        if (modalidadeExists.rowCount === 0) {
            // Se não existe, insere a nova modalidade
            await pool.query('INSERT INTO "Modalidades" (mod_ensino, mod_oferta, data_criacao, num_questoes) VALUES ($1, $2, NOW() , $3)', [mod_ensino, mod_oferta, num_questoes]);
            await pool.query('COMMIT');
            res.status(200).json({ message: 'Modalidade cadastrada com sucesso.' });
        } else {
            // Se já existe, faz rollback e retorna erro
            await pool.query('ROLLBACK');
            return res.status(400).json({ error: 'Modalidade já existe.' });
        }
    } catch (err) {
        // Em caso de erro, faz rollback e retorna erro 500
        await pool.query('ROLLBACK');
        res.status(500).json(err);
    }
};

const updateModalidades = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { mod_ensino, mod_oferta } = req.body;

        console.log('Início da atualização de modalidades. Dados recebidos:', { mod_ensino, mod_oferta });

        if (!mod_ensino) {
          console.error('Erro: Modalidade não fornecida.');
          return res.status(400).json({ error: 'O campo modalidade é obrigatório e não pode ser nulo.' });
        }

        await pool.query('BEGIN');

        const modalidadesExists = await pool.query('SELECT * FROM "Modalidades" WHERE id = $1', [id]);
        console.log('Verificação de existência do eixo:', modalidadesExists.rowCount > 0 ? 'Modalidade existe' : 'Modalidade não existe');

        if (modalidadesExists.rowCount === 0) {
            await pool.query('ROLLBACK');
            console.error('Modalidade: Modalidade não existe.', {numero});
            return res.status(400).json({error: 'Modalidade não existe.'});
        } else {
          await pool.query('UPDATE "Modalidades" SET mod_ensino = $1, mod_oferta = $2 WHERE id = $3', [mod_ensino, mod_oferta, id]);
          console.log('Modalidade atualizada com sucesso:', { id, mod_ensino, mod_oferta });

          await pool.query('COMMIT');
          console.log('Transação concluída com sucesso. Modalidade atualizada.');
          res.status(200).json({ message: 'Modalidade atualizada com sucesso.' });
        }

      } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Erro inesperado:', err);
        res.status(500).json(err);
      }
};

const deleteModalidades = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        console.log('Número da modalidade recebido:', id);

        await pool.query('BEGIN');

        const modalidadesExists = await pool.query('SELECT * FROM "Modalidades" WHERE id = $1', [id]);
        console.log('Verificação de existência do eixo:', modalidadesExists.rowCount > 0? 'Modalidade existe' : 'Modalidade não existe');

        if (modalidadesExists.rowCount === 0) {
            await pool.query('ROLLBACK');
            console.error('Erro: Modalidade não existe.', { id });
            return res.status(404).json({ error: 'Modalidade não encontrada.' });
        } else {
            await pool.query('DELETE FROM "Modalidades" WHERE id = $1', [id]);
            console.log('Modalidade deletada com sucesso:', id);

            await pool.query('COMMIT');
            console.log('Transação concluída com sucesso.');
            res.status(200).json({ message: 'Modalidade deletada com sucesso.' });
        }

    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Erro inesperado:', err);
        res.status(500).json(err);
    }
};





module.exports = {
    postModalidades,
    getModalidades,
    updateModalidades,
    getModalidadesByNumero,
    deleteModalidades
};