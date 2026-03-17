// /app.js
const express = require('express');
const cors = require('cors');
const app = express();
const eixosRouter = require('./routes/eixosRouter');
const dimensoesRouter = require('./routes/dimensoesRouter');
const authRouter = require('./routes/authRouter');
const adminRouter = require('./routes/adminRouter');
const { authenticateToken, authorize } = require('./middleware/authMiddleware');
const padraoRespostaRouter = require('./routes/padraoRespostaRouter');
const questoesRouter = require('./routes/questoesRouter');
const categoriasRouter = require('./routes/categoriasRouter');
const modalidadesRouter = require('./routes/modalidadesRouter');
const alternativasRouter = require('./routes/alternativasRouter');
const avaliacoesRouter = require('./routes/avaliacoesRouter');
const unidadesRouter = require('./routes/unidadesRouter');
const LyceumService = require('./services/lyceumService');
const CronImportarCursos = require('./cron/CronImportarCursos')
const municipiosRouter= require('./routes/municipiosRouter');
const cursosRouter= require('./routes/cursosRouter');
const respostasRouter = require('./routes/respostasRouter');
const tipoQuestoesRouter = require('./routes/tipoQuestoesRouter');

const dotenv = require('dotenv');

const lycService = new LyceumService();
const cronImportarCursos = new CronImportarCursos();

lycService.getUnidadeCursos().then(async (response) => {
    const cursos = response.UNIDADECURSOS;
    const result = await cronImportarCursos.execAsync(cursos);
})


// Configura o CORS para permitir requisições de qualquer origem
app.use(cors());

// Resto da configuração do servidor
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/', padraoRespostaRouter);
app.use('/api/', questoesRouter);
app.use('/api/', categoriasRouter)
app.use('/api/', modalidadesRouter);
app.use('/api/', avaliacoesRouter);
app.use('/api/', alternativasRouter);
app.use('/api/', unidadesRouter);
app.use('/api/', municipiosRouter);
app.use('/api/', cursosRouter);
app.use('/api/', respostasRouter);
app.use('/api/', tipoQuestoesRouter)

// Rotas abertas para todos os usuários autenticados, com permissões específicas
app.use('/api/', authenticateToken, authorize(['read:modalidades']), modalidadesRouter);
app.use('/api/', authenticateToken, eixosRouter);
app.use('/api/dimensoes', authenticateToken, authorize(['read:dimensoes']), dimensoesRouter);


// Rotas exclusivas para admins
app.use('/api/', authenticateToken, authorize(['admin']), adminRouter); // Registra as rotas de admins

// Inicia o servidor
const PORT = process.env.PORT || 3034;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
