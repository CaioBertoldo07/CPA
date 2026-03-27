import axios, { AxiosInstance } from 'axios';
import https from 'https';
import { LyceumCursoDTO } from '../dtos/LyceumDTO';
import { env, isProduction } from '../config/env';

interface LyceumUnidadesResponse {
    UNIDADECURSOS: LyceumCursoDTO[];
}

const httpsAgent = new https.Agent({
    rejectUnauthorized: isProduction && !env.DISABLE_SSL_VALIDATION,
});

class LyceumService {
    private axiosInstance: AxiosInstance;
    private lyceumBaseUrl = 'https://api.uea.edu.br/lyceum/';
    private lyceumConsumerEmail: string;
    private lyceumConsumerPassword: string;

    constructor() {
        this.lyceumConsumerEmail = process.env.LYCEUM_CONSUMER_EMAIL || '';
        this.lyceumConsumerPassword = process.env.LYCEUM_CONSUMER_PASSWORD || '';

        if (!this.lyceumConsumerEmail || !this.lyceumConsumerPassword) {
            throw new Error('Lyceum consumer credentials are not set in the environment variables.');
        }

        // Configurando o Axios para suportar grandes respostas
        this.axiosInstance = axios.create({
            baseURL: this.lyceumBaseUrl,
            timeout: 10000,
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            httpsAgent,
        });

        // Interceptor para adicionar o token nas requisições
        this.axiosInstance.interceptors.request.use(
            async (config) => {
                const token = await this.getConsumerJwtToken();
                if (token && config.headers) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );
    }

    async getUnidadeCursos(): Promise<LyceumUnidadesResponse> {
        try {
            const response = await this.axiosInstance.get<LyceumUnidadesResponse>('unidadecurso/listar');
            return response.data;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Erro ao obter unidades de curso:', errorMessage);
            throw error;
        }
    }

    async getAlunoInfo(universityToken: string): Promise<any> {
        try {
            const response = await axios.get(
                'https://api-carteira.uea.edu.br/lyceum/cadu/aluno/matriculapessoal',
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${universityToken}`,
                    },
                    httpsAgent,
                }
            );

            if (response.status !== 200 || !response.data.status) {
                throw new Error('Erro ao obter informações detalhadas do aluno.');
            }

            return response.data.message[0];
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Erro ao obter informações do aluno no Lyceum:', errorMessage);
            throw error;
        }
    }

    async getConsumerJwtToken(): Promise<string> {
        try {
            const response = await axios.post<{ APILYCEUM: { token: string } }>(`${this.lyceumBaseUrl}login`, {
                email: this.lyceumConsumerEmail,
                senha: this.lyceumConsumerPassword
            });

            if (response.status !== 200) {
                throw new Error('Falha ao buscar token!');
            }

            return response.data.APILYCEUM.token;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Erro ao autenticar no Lyceum:', errorMessage);
            throw error;
        }
    }
}

export default LyceumService;
