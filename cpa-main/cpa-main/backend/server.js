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
const municipiosRouter = require('./routes/municipiosRouter');
const cursosRouter = require('./routes/cursosRouter');
const respostasRouter = require('./routes/respostasRouter');
const tipoQuestoesRouter = require('./routes/tipoQuestoesRouter');

const dotenv = require('dotenv');
dotenv.config();

const LyceumService = require('./services/lyceumService');
const CronImportarCursos = require('./cron/CronImportarCursos');
const lycService = new LyceumService();
const cronImportarCursos = new CronImportarCursos();
lycService.getUnidadeCursos().then(async (response) => {
    const cursos = response.UNIDADECURSOS;
    const result = await cronImportarCursos.execAsync(cursos);
})

app.use(cors());
app.use(express.json());

// Rota pública — login
app.use('/api/auth', authRouter);

// Rotas protegidas — qualquer usuário autenticado
app.use('/api/', authenticateToken, padraoRespostaRouter);
app.use('/api/', authenticateToken, questoesRouter);
app.use('/api/', authenticateToken, categoriasRouter);
app.use('/api/', authenticateToken, modalidadesRouter);
app.use('/api/', authenticateToken, avaliacoesRouter);
app.use('/api/', authenticateToken, alternativasRouter);
app.use('/api/', authenticateToken, unidadesRouter);
app.use('/api/', authenticateToken, municipiosRouter);
app.use('/api/', authenticateToken, cursosRouter);
app.use('/api/', authenticateToken, respostasRouter);
app.use('/api/', authenticateToken, tipoQuestoesRouter);

// Rotas protegidas com permissão específica
app.use('/api/', authenticateToken, eixosRouter);
app.use('/api/dimensoes', authenticateToken, dimensoesRouter);

// Rotas exclusivas para admin
app.use('/api/', authenticateToken, authorize(['admin']), adminRouter);

const PORT = process.env.PORT || 3034;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});