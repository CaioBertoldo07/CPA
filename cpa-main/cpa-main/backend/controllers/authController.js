const axios = require('axios');
const https = require('https');
const jwt = require('jsonwebtoken');
const adminRepository = require('../repositories/adminRepository');

const loginDev = async (req, res) => {
  const { email, senha } = req.body;
  // Aceita qualquer email e senha para desenvolvimento, mas atribui permissões de admin apenas para um email específico
  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  // Verficia se o email é o do admin para atribuir permissões
  const admin = await adminRepository.findByEmail(email);
  const isAdmin = !!admin;

  const user = {
    email,
    permissions: isAdmin
      ? ['read:eixos', 'read:dimensoes', 'write:eixos', 'write:dimensoes', 'admin']
      : ['read:eixos', 'read:dimensoes', 'read:modalidades'],
    isAdmin,
    curso: 'CURSO_TESTE',
    unidade: 'UNIDADE_TESTE',
    matricula: '2021000001',
    oberonPerfilNome: isAdmin ? 'ADMIN' : 'DISCENTENTE',
    usuarioNome: email.split('@')[0],
    universityToken: 'fake-token-dev', // Token falso para desenvolvimento
  }

  const token = jwt.sign(user, process.env.SECRET_KEY, { expiresIn: '24h' });

  return res.json({
    token,
    universityToken: 'fake-token-dev',
    usuario: email,
    isAdmin,
    curso: user.curso,
    unidade: user.unidade,
    matricula: user.matricula,
    oberonPerfilNome: user.oberonPerfilNome,
    usuarioNome: user.usuarioNome,
  })
}

// Definição de permissões por tipo de usuário
const PERMISSIONS = {
  admin: ['read:eixos', 'read:dimensoes', 'write:eixos', 'write:dimensoes', 'admin'],
  aluno: ['read:eixos', 'read:dimensoes', 'read:modalidades'],
};

// Cria um agente HTTPS que ignora a verificação de certificado SSL
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    // Autentica o aluno na API da universidade
    const response = await axios.post(
      'https://api.uea.edu.br/lyceum/login',
      { email, senha },
      {
        headers: { 'Content-Type': 'application/json' },
        httpsAgent,
      }
    );

    const data = response.data;
    console.log('Resposta da API:', data.message);

    if (response.status !== 200 || !data.APILYCEUM || data.APILYCEUM.status === false) {
      console.log('Falha na autenticação:', response.status, data);
      return res.status(401).json(data);
    }

    console.log('Autenticação bem-sucedida para:', data.APILYCEUM.usuario.UsuarioNome);

    // Captura o token de autenticação da API da universidade
    const universityToken = data.APILYCEUM.token;
    if (!universityToken) {
      return res.status(403).json({ error: 'Token de autenticação da universidade não encontrado.' });
    }

    // Consulta o endpoint para obter as informações do curso do aluno
    const alunoResponse = await axios.get(
      'https://api-carteira.uea.edu.br/lyceum/cadu/aluno/matriculapessoal',
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${universityToken}`,
        },
        httpsAgent,
      }
    );

    if (alunoResponse.status !== 200 || !alunoResponse.data.status) {
      console.error('Erro ao obter informações do aluno');
      return res.status(500).json({ error: 'Erro ao obter informações do aluno.' });
    }

    const alunoData = alunoResponse.data.message[0]; // Assumindo que o aluno é encontrado
    const curso = alunoData.CURSO;
    const unidade = alunoData.UNIDADE_NOME;
    const matricula = alunoData.ALUNO;
    const oberonPerfilNome = data.APILYCEUM.usuario.OberonPerfilNome;
    const usuarioNome = data.APILYCEUM.usuario.UsuarioNome;

    // Verifica se o usuário é um administrador
    const admin = await adminRepository.findByEmail(email);
    const isAdmin = !!admin;
    const userPermissions = isAdmin ? PERMISSIONS.admin : PERMISSIONS.aluno;

    // Cria o payload do JWT, incluindo o token da universidade.
    // Esse payload será decodificado no middleware de autenticação para acesso às propriedades do usuário.
    const user = {
      email,
      permissions: userPermissions,
      isAdmin,
      curso,
      unidade,
      matricula,
      oberonPerfilNome,
      usuarioNome,
      universityToken, // Token da universidade incluído para uso posterior
    };

    // Gera o token JWT com expiração de 24 horas
    const token = jwt.sign(user, process.env.SECRET_KEY, { expiresIn: '24h' });

    // Retorna os tokens separadamente: o JWT do backend e o token da universidade
    res.json({
      token,                // JWT gerado pelo backend (contém informações do usuário, inclusive o universityToken)
      universityToken,      // Token obtido da API da universidade
      usuario: email,
      isAdmin,
      curso,
      unidade,
      matricula,
      oberonPerfilNome,
      usuarioNome,
    });

    console.log('isAdmin:', isAdmin);
    console.log('Curso do aluno:', curso);
    console.log('Perfil do aluno:', oberonPerfilNome);
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro ao fazer login.' });
  }
};

const register = async (req, res) => {
  res.status(501).json({ message: 'Registro não implementado.' });
};

module.exports = { login, loginDev, register };
