import express from 'express';
import cors from 'cors';
const app = express();

import eixosRouter from './routes/eixosRouter';
import dimensoesRouter from './routes/dimensoesRouter';
import authRouter from './routes/authRouter';
import adminRouter from './routes/adminRouter';
import { authenticateToken, authorize } from './middleware/authMiddleware';
import padraoRespostaRouter from './routes/padraoRespostaRouter';
import questoesRouter from './routes/questoesRouter';
import categoriasRouter from './routes/categoriasRouter';
import modalidadesRouter from './routes/modalidadesRouter';
import alternativasRouter from './routes/alternativasRouter';
import avaliacoesRouter from './routes/avaliacoesRouter';
import unidadesRouter from './routes/unidadesRouter';
import municipiosRouter from './routes/municipiosRouter';
import cursosRouter from './routes/cursosRouter';
import respostasRouter from './routes/respostasRouter';
import tipoQuestoesRouter from './routes/tipoQuestoesRouter';
import { errorHandler } from './middleware/errorMiddleware';

import dotenv from 'dotenv';
dotenv.config();

import LyceumService from './services/lyceumService';
import { CronImportarCursos } from './cron/CronImportarCursos';
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

// Middleware de tratamento de erro (DEVE ser o último)
app.use(errorHandler);

const PORT = process.env.PORT || 3034;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});