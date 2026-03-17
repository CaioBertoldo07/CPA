const Avaliador = require('../models/Avaliador');
const bcrypt = require('bcrypt');

// Get all avaliadores
const getAvaliadores = async (req, res) => {
  try {
    const avaliadores = await Avaliador.getAvaliadores();
    res.json(avaliadores);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar avaliadores', error });
  }
};

// Create a new avaliador
const createAvaliador = async (req, res) => {
  const { email, cpf } = req.body;

  try {
    const hashedCPF = await bcrypt.hash(cpf, 10);
    const avaliador = await Avaliador.createAvaliador(email, hashedCPF);
    res.status(201).send({ avaliadorId: avaliador.matricula });
  } catch (err) {
    if (err.constraint === 'avaliadores_email_key') {
      res.status(400).send({ message: 'Email já em uso' });
    } else {
      console.error(err);
      res.status(500).send({ message: 'Erro no servidor' });
    }
  }
};

// Get a single avaliador by id
const getAvaliadorById = async (req, res) => {
  const { id } = req.params;

  try {
    const avaliador = await Avaliador.getAvaliadorById(id);
    if (avaliador) {
      res.json(avaliador);
    } else {
      res.status(404).send({ message: 'Avaliador não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar avaliador', error });
  }
};

// Update an avaliador
const updateAvaliador = async (req, res) => {
  const { id } = req.params;
  const { email, cpf } = req.body;

  try {
    const hashedCPF = await bcrypt.hash(cpf, 10);
    const result = await Avaliador.updateAvaliador(id, email, hashedCPF);
    if (result) {
      res.status(200).send({ message: 'Avaliador atualizado com sucesso' });
    } else {
      res.status(404).send({ message: 'Avaliador não encontrado' });
    }
  } catch (error) {
    if (error.constraint === 'avaliadores_email_key') {
      res.status(400).send({ message: 'Email já em uso' });
    } else {
      console.error(error);
      res.status(500).send({ message: 'Erro no servidor' });
    }
  }
};

// Delete an avaliador
const deleteAvaliador = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await Avaliador.deleteAvaliador(id);
    if (result) {
      res.status(200).send({ message: 'Avaliador deletado com sucesso' });
    } else {
      res.status(404).send({ message: 'Avaliador não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar avaliador', error });
  }
};

module.exports = {
  getAvaliadores,
  createAvaliador,
  getAvaliadorById,
  updateAvaliador,
  deleteAvaliador,
};