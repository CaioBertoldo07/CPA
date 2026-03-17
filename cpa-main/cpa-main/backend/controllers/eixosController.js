const pool = require('../database');

const postEixos = async (req, res) => {
    try {
        const {numero, nome, dimensoes} = req.body;

        if (!numero || !nome || !dimensoes || dimensoes.length === 0) {
            return res.status(400).json({error: 'Todos os campos são obrigatórios e não podem ser nulos.'});
        }

        await pool.query('BEGIN');

        const eixoExists = await pool.query('SELECT * FROM "Eixos" WHERE numero = $1', [numero]);
        if (eixoExists.rowCount === 0) {
            await pool.query('INSERT INTO "Eixos" (numero, nome) VALUES ($1, $2)', [numero, nome]);

            for (const dimensao of dimensoes) {
                const {numero: numeroDimensao, nome: nomeDimensao} = dimensao;
                const dimensaoExists = await pool.query('SELECT * FROM "Dimensoes" WHERE numero = $1', [numeroDimensao]);
                if (dimensaoExists.rowCount === 0) {
                    await pool.query('INSERT INTO "Dimensoes" (numero, nome, numero_eixos, data_criacao) VALUES ($1, $2, $3, NOW())', [numeroDimensao, nomeDimensao, numero]);
                } else {
                    await pool.query('ROLLBACK');
                    return res.status(400).json({error: 'Dimensão já existe.'});
                }
            }
            await pool.query('COMMIT');
            res.status(200).json({message: 'Eixo e dimensões cadastrados com sucesso.'});
        } else {
            await pool.query('ROLLBACK');
            return res.status(400).json({error: 'Eixo já existe.'});
        }
    } catch (err) {
        await pool.query('ROLLBACK');
        res.status(500).json(err);
    }
};

const updateEixos = async (req, res) => {
  try {
    const numero = parseInt(req.params.numero, 10);
    const { nome } = req.body;

    console.log('Início da atualização do eixo. Dados recebidos:', { numero, nome });

    if (!nome) {
      console.error('Erro: Nome não fornecido.');
      return res.status(400).json({ error: 'O campo nome é obrigatório e não pode ser nulo.' });
    }

    await pool.query('BEGIN');

    const eixoExists = await pool.query('SELECT * FROM "Eixos" WHERE numero = $1', [numero]);
    console.log('Verificação de existência do eixo:', eixoExists.rowCount > 0 ? 'Eixo existe' : 'Eixo não existe');

    if (eixoExists.rowCount === 0) {
      await pool.query('ROLLBACK');
      console.error('Erro: Eixo não existe.', { numero });
      return res.status(400).json({ error: 'Eixo não existe.' });
    } else {
      await pool.query('UPDATE "Eixos" SET nome = $1 WHERE numero = $2', [nome, numero]);
      console.log('Eixo atualizado com sucesso:', { numero, nome });

      await pool.query('COMMIT');
      console.log('Transação concluída com sucesso. Eixo atualizado.');
      res.status(200).json({ message: 'Eixo atualizado com sucesso.' });
    }

  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Erro inesperado:', err);
    res.status(500).json(err);
  }

};

const getEixos = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT numero, nome
            FROM "Eixos"
            ORDER BY numero ASC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({error: 'Erro ao buscar eixos.'});
    }
};




const getEixoByNumero = async (req, res) => {
  const { numeroEixo } = req.params;
  console.log('Número do eixo recebido:', numeroEixo);

  try {
    const numeroEixoInt = parseInt(numeroEixo, 10);
    console.log('Número do eixo convertido:', numeroEixoInt);

    if (isNaN(numeroEixoInt)) {
      return res.status(400).json({ message: 'Número do eixo inválido.' });
    }

    const result = await pool.query(`
      SELECT numero, nome
      FROM "Eixos"
      WHERE numero = $1
    `, [numeroEixoInt]);

    console.log('Resultado da consulta:', result.rows);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Eixo não encontrado.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Erro ao buscar eixo.' });
  }

    
};

const deleteEixos = async (req, res) => {
  const { numero } = req.params;

  try {
    await pool.query('BEGIN');
    console.log('Transação iniciada para deletar eixo:', numero);

    const eixoExists = await pool.query('SELECT * FROM "Eixos" WHERE numero = $1', [numero]);
    console.log('Verificação de existência do eixo:', eixoExists.rowCount > 0 ? 'Eixo existe' : 'Eixo não existe');

    if (eixoExists.rowCount === 0) {
      await pool.query('ROLLBACK');
      console.error('Erro: Eixo não existe.', { numero });
      return res.status(404).json({ error: 'Eixo não encontrado.' });
    } else {
      await pool.query('DELETE FROM "Dimensoes" WHERE numero_eixos = $1', [numero]);
      console.log('Dimensões associadas ao eixo deletadas:', numero);

      await pool.query('DELETE FROM "Eixos" WHERE numero = $1', [numero]);
      console.log('Eixo deletado com sucesso:', numero);

      await pool.query('COMMIT');
      console.log('Transação concluída com sucesso.');
      res.status(200).json({ message: 'Eixo e suas dimensões deletados com sucesso.' });
    }
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Erro inesperado:', err);
    res.status(500).json(err);
  }
};

// Exportar a função deleteEixos
module.exports = {
  postEixos,
  updateEixos,
  getEixos,
  getEixoByNumero,
  deleteEixos // Adicionada a exportação da função deleteEixos
};

