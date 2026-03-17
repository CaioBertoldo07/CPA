const pool = require('../database');

// Função para adicionar uma nova dimensão
const postDimensoes = async (req, res) => {
    try {
        const {numero, nome, numero_eixos} = req.body;  // Removi data_criacao de destructuring


        if (!numero || !nome || numero_eixos === null || numero_eixos === undefined) {
            return res.status(400).send('All fields are required and cannot be null.');
        }

        await pool.query('BEGIN');

        const dimensaoResult = await pool.query(`
            INSERT INTO "Dimensoes"(numero, nome, numero_eixos, data_criacao)
            VALUES ($1, $2, $3, NOW())
            RETURNING *

        `, [numero, nome, numero_eixos]);  // Removi data_criacao de parâmetros

        await pool.query('COMMIT');

        res.json(dimensaoResult.rows[0]);
    } catch (err) {
        await pool.query('ROLLBACK');
        res.status(500).send('Server Error');
    }
};

const getNumeroEixoByDimensao = async (req, res) => {
    const { numeroDimensao } = req.params;
    console.log('Número da dimensão recebido:', numeroDimensao);

    try {
        const result = await pool.query(`
            SELECT numero_eixos
            FROM "Dimensoes"
            WHERE numero = $1
        `, [numeroDimensao]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Dimensão não encontrada.' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Erro ao buscar o número do eixo.' });
    }
};

// Função para obter dimensões por número do eixo

// Função para obter todas as dimensões
const getDimensoes = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
            numero, 
            nome, 
            numero_eixos, 
            TO_CHAR(data_criacao, 'DD/MM/YYYY') as data_criacao
            FROM "Dimensoes"
            ORDER BY numero_eixos ASC  -- Ordena por numero_eixos em ordem crescente
            `);
            res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Erro ao buscar dimensões.' });
        }
    };
    
const getDimensaoByNumero = async (req, res) => {
    const { numero } = req.params;
    console.log('Número da dimensão recebida:', numero); // Log de diagnóstico

    try {
        const result = await pool.query(`
            SELECT numero, nome, numero_eixos, TO_CHAR(data_criacao, 'DD/MM/YYYY') as data_criacao
            FROM "Dimensoes" 
            WHERE numero = $1
        `, [numero]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Dimensão não encontrada.' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Erro ao buscar a dimensão.' });
    }
};

// Função para obter dimensões por número do eixo
const getDimensoesByEixo = async (req, res) => {
    const {numeroEixo} = req.params;

    try {
        const result = await pool.query(`
            SELECT numero, nome
            FROM "Dimensoes"
            WHERE numero_eixos = $1
        `, [numeroEixo]);

        if (result.rows.length === 0) {
            return res.status(404).json({message: 'Nenhuma dimensão encontrada para este eixo.'});
        }

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({error: 'Erro ao buscar dimensões.'});
    }
};

const updateDimensao = async (req, res) => {
    const { numero } = req.params;
    const { novoNumero, nome, numero_eixos } = req.body;
    try {
        await pool.query('BEGIN');
        console.log('Transação iniciada para atualização da dimensão:', numero);

        // Verificar se a dimensão existe
        const dimensaoExists = await pool.query('SELECT * FROM "Dimensoes" WHERE numero = $1', [numero]);
        if (dimensaoExists.rowCount === 0) {
            await pool.query('ROLLBACK');
            console.error('Erro: Dimensão não encontrada para atualizar.', { numero });
            return res.status(404).json({ message: 'Dimensão não encontrada para atualizar.' });
        }

        // Verificar se o eixo existe
        const eixoExists = await pool.query('SELECT * FROM "Eixos" WHERE numero = $1', [numero_eixos]);
        if (eixoExists.rowCount === 0) {
            await pool.query('ROLLBACK');
            console.error('Erro: Eixo não encontrado para o número_eixos.', { numero_eixos });
            return res.status(400).json({ message: 'Número de eixo fornecido não existe.' });
        }

        // Atualizar a dimensão
        const result = await pool.query(`

            UPDATE "Dimensoes" 
            SET numero = $1, nome = $2, numero_eixos = $3
            WHERE numero = $4
            RETURNING *
        `, [novoNumero, nome, numero_eixos, numero]);

        await pool.query('COMMIT');
        console.log('Dimensão atualizada com sucesso:', result.rows[0]);
        res.json(result.rows[0]);
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Erro inesperado:', err);
        res.status(500).json({ error: 'Erro ao atualizar a dimensão.' });

    }
};



// Função para deletar uma dimensão
const deleteDimensao = async (req, res) => {
    const { numero } = req.params;

    try {
        await pool.query('BEGIN');
        console.log('Transação iniciada para deletar dimensão:', numero); // Log de diagnóstico

        // Verifica se a dimensão existe
        const dimensaoExists = await pool.query('SELECT * FROM "Dimensoes" WHERE numero = $1', [numero]);
        console.log('Verificação de existência da dimensão:', dimensaoExists.rowCount > 0 ? 'Dimensão existe' : 'Dimensão não existe'); // Log de diagnóstico

        if (dimensaoExists.rowCount === 0) {
            await pool.query('ROLLBACK');
            console.error('Erro: Dimensão não existe.', { numero }); // Log de diagnóstico
            return res.status(404).json({ error: 'Dimensão não encontrada.' });
        } else {
            await pool.query('DELETE FROM "Dimensoes" WHERE numero = $1', [numero]);
            console.log('Dimensão deletada com sucesso:', numero); // Log de diagnóstico

            await pool.query('COMMIT');
            console.log('Transação concluída com sucesso.'); // Log de diagnóstico
            res.status(200).json({ message: 'Dimensão deletada com sucesso.' });
        }
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Erro inesperado:', err); // Log de diagnóstico
        res.status(500).json({ error: 'Erro ao deletar a dimensão.' });
    }
};

module.exports = {
    getDimensoesByEixo,
    getDimensoes,
    postDimensoes,
    getDimensaoByNumero,
    updateDimensao,
    deleteDimensao,
    getNumeroEixoByDimensao
};

