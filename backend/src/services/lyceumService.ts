import axios, { AxiosError, AxiosInstance } from 'axios';
import https from 'https';
import { LyceumCursoDTO } from '../dtos/LyceumDTO';
import { env, isProduction } from '../config/env';

// ─── DTOs internos ────────────────────────────────────────────────────────────

export interface LyceumUnidadesResponse {
    UNIDADECURSOS: LyceumCursoDTO[];
}

export interface LyceumApiLoginPayload {
    token: string;
    status: boolean;
    usuario?: Record<string, unknown>;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const LYCEUM_TIMEOUT_MS = 15_000;

const httpsAgent = new https.Agent({
    rejectUnauthorized: isProduction && !env.DISABLE_SSL_VALIDATION,
});

// ─── LyceumService ────────────────────────────────────────────────────────────

class LyceumService {
    /** Base URL inclui /lyceum/ para que caminhos relativos funcionem corretamente. */
    private readonly baseUrl: string;
    private readonly consumerEmail: string;
    private readonly consumerPassword: string;

    /** Instância sem token — usada para login e chamadas com token do usuário. */
    private readonly baseAxios: AxiosInstance;

    /** Instância com interceptor que injeta o token do consumer (cron/import). */
    private readonly consumerAxios: AxiosInstance;

    constructor() {
        this.baseUrl = `${env.LYCEUM_API_BASE_URL}/lyceum/`;
        this.consumerEmail = env.LYCEUM_CONSUMER_EMAIL ?? '';
        this.consumerPassword = env.LYCEUM_CONSUMER_PASSWORD ?? '';

        const axiosDefaults = {
            baseURL: this.baseUrl,
            timeout: LYCEUM_TIMEOUT_MS,
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            httpsAgent,
        };

        this.baseAxios = axios.create(axiosDefaults);
        this.consumerAxios = axios.create(axiosDefaults);

        // Injeta o token do consumer em todas as requisições da instância dedicada.
        this.consumerAxios.interceptors.request.use(
            async (config) => {
                const token = await this.getConsumerToken();
                if (token && config.headers) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );
    }

    // ─── Método base de tratamento de erro ────────────────────────────────────

    private handleError(method: string, error: unknown): never {
        if (error instanceof AxiosError) {
            const status = error.response?.status ?? 'timeout/network';
            console.error(
                `[LyceumService] ${method} — HTTP ${status}: ${error.message}`,
                { url: error.config?.url, data: error.response?.data }
            );
        } else {
            const msg = error instanceof Error ? error.message : String(error);
            console.error(`[LyceumService] ${method} — erro inesperado: ${msg}`);
        }
        throw error;
    }

    // ─── Autenticação ─────────────────────────────────────────────────────────

    /**
     * Obtém o token JWT do consumer (conta de serviço usada pelo cron de importação).
     * Usa baseAxios para evitar recursão com o interceptor de consumerAxios.
     */
    async getConsumerToken(): Promise<string> {
        if (!this.consumerEmail || !this.consumerPassword) {
            throw new Error(
                '[LyceumService] Credenciais do consumer não configuradas ' +
                '(LYCEUM_CONSUMER_EMAIL / LYCEUM_CONSUMER_PASSWORD).'
            );
        }
        try {
            const response = await this.baseAxios.post<{ APILYCEUM: LyceumApiLoginPayload }>(
                'login',
                { email: this.consumerEmail, senha: this.consumerPassword }
            );
            const token = response.data?.APILYCEUM?.token;
            if (!token) throw new Error('Token do consumer ausente na resposta.');
            return token;
        } catch (error) {
            return this.handleError('getConsumerToken', error);
        }
    }

    /**
     * Autentica um usuário (discente/docente/técnico) via credenciais UEA.
     * Em produção usa /login; em homolog usa /loginteste.
     */
    async loginUser(email: string, senha?: string): Promise<LyceumApiLoginPayload> {
        const path = isProduction ? 'login' : 'loginteste';
        try {
            const response = await this.baseAxios.post<{ APILYCEUM: LyceumApiLoginPayload }>(
                path,
                { email, senha }
            );
            const payload = response.data?.APILYCEUM;
            if (!payload || payload.status === false) {
                throw new Error('Falha na autenticação da universidade.');
            }
            return payload;
        } catch (error) {
            return this.handleError('loginUser', error);
        }
    }

    // ─── Endpoints de aluno ───────────────────────────────────────────────────

    /**
     * Busca dados de matrícula pessoal do aluno usando o token universitário
     * emitido pelo Lyceum no momento do login do usuário.
     */
    async getAlunoMatricula(universityToken: string): Promise<Record<string, unknown>> {
        try {
            const response = await this.baseAxios.get<{
                status: boolean;
                message: Array<Record<string, unknown>>;
            }>('aluno/listar/matriculapessoal', {
                headers: { Authorization: `Bearer ${universityToken}` },
            });

            if (!response.data?.status) {
                throw new Error('Erro ao obter informações detalhadas do aluno.');
            }

            return (response.data.message ?? [])[0] ?? {};
        } catch (error) {
            return this.handleError('getAlunoMatricula', error);
        }
    }

    // ─── Endpoints de importação (consumer) ───────────────────────────────────

    /**
     * Busca lista de unidades/cursos para importação.
     * Requer LYCEUM_CONSUMER_EMAIL e LYCEUM_CONSUMER_PASSWORD configurados.
     */
    async getUnidadeCursos(): Promise<LyceumUnidadesResponse> {
        try {
            const response = await this.consumerAxios.get<LyceumUnidadesResponse>(
                'unidadecurso/listar'
            );
            return response.data;
        } catch (error) {
            return this.handleError('getUnidadeCursos', error);
        }
    }
}

export default LyceumService;
