const axios = require('axios');
const { AxiosInstance } = require('axios');

class LyceumService {
    /**
     * @type {AxiosInstance}
     */
    axiosInstance;

    lyceumBaseUrl = 'https://api.uea.edu.br/lyceum/';
    lyceumConsumerEmail;
    lyceumConsumerPassword;

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
            maxContentLength: Infinity, // Permite qualquer tamanho de conteúdo
            maxBodyLength: Infinity,   // Permite qualquer tamanho de corpo
        });

        // Interceptor para adicionar o token nas requisições
        this.axiosInstance.interceptors.request.use(
            async (config) => {
                const token = await this.getConsumerJwtToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );
    }

    async getUnidadeCursos() {
        try {
            const response = await this.axiosInstance.get('unidadecurso/listar');
            console.log('Tamanho da resposta:', response.headers['content-length'] || 'indisponível');
            return response.data;
        } catch (error) {
            console.error('Erro ao obter unidades de curso:', error.message);
            throw error;
        }
    }

    async getConsumerJwtToken() {
        try {
            const response = await axios.post(`${this.lyceumBaseUrl}login`, {
                email: this.lyceumConsumerEmail,
                senha: this.lyceumConsumerPassword
            });

            if (response.status !== 200) {
                throw new Error('Falha ao buscar token!');
            }

            return response.data.APILYCEUM.token;
        } catch (error) {
            console.error('Erro ao autenticar no Lyceum:', error.message);
            throw error;
        }
    }
}

module.exports = LyceumService;
