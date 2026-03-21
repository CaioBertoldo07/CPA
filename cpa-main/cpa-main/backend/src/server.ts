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

const shouldImportCursosOnStart = process.env.IMPORT_CURSOS_ON_START === 'true';

if (shouldImportCursosOnStart) {
    let lycService: LyceumService | undefined;
    let cronImportarCursos: CronImportarCursos | undefined;

    try {
        lycService = new LyceumService();
        cronImportarCursos = new CronImportarCursos();
    } catch (err) {
        console.error('Erro ao inicializar LyceumService ou CronImportarCursos:', err);
    }

    if (lycService && cronImportarCursos) {
        const cron = cronImportarCursos;
        lycService
            .getUnidadeCursos()
            .then(async (response) => {
                const cursos =
                    response &&
                    Object.prototype.hasOwnProperty.call(response, 'UNIDADECURSOS') &&
                    Array.isArray(response.UNIDADECURSOS)
                        ? response.UNIDADECURSOS
                        : null;

                if (!cursos) {
                    console.error(
                        'Resposta inválida de LyceumService.getUnidadeCursos; propriedade UNIDADECURSOS ausente ou em formato inesperado.',
                        response && (response as any).UNIDADECURSOS
                    );
                    return;
                }

                await cron.execAsync(cursos);
            })
            .catch((error) => {
                console.error('Erro ao importar cursos a partir do LyceumService:', error);
            });
    }
}

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