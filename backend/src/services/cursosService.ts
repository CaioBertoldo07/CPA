import * as cursosRepository from '../repositories/cursosRepository';
import { CursoResponseDTO } from '../dtos/CursoDTO';

class CursosService {
    async getAll(filters?: {
        nome?: string;
        codigo?: string;
        curso_tipo?: string;
        unidade?: string;
        municipio?: string;
        unidadeIds?: string;
        municipioIds?: string;
        modalidadeIds?: string;
        unclassified?: string;
        ativo?: string;
    }): Promise<CursoResponseDTO[]> {
        return await cursosRepository.findAll(filters) as CursoResponseDTO[];
    }

    async getByModalidades(modalidadeIds: number[]): Promise<CursoResponseDTO[]> {
        return await cursosRepository.findByModalidades(modalidadeIds) as CursoResponseDTO[];
    }

    async getByUnidades(unidadeIds: number[]): Promise<CursoResponseDTO[]> {
        return await cursosRepository.findByUnidades(unidadeIds) as CursoResponseDTO[];
    }

    async getPaginated(params: {
        page: number;
        pageSize: number;
        filters?: {
            nome?: string;
            codigo?: string;
            curso_tipo?: string;
            unidade?: string;
            municipio?: string;
            unclassified?: string;
            unidadeIds?: string;
            municipioIds?: string;
            modalidadeIds?: string;
            ativo?: string;
        }
    }) {
        return await cursosRepository.findPaginated(params);
    }

    async classifyCursos(cursoIds: number[], idModalidade: number) {
        return await cursosRepository.updateManyModality(cursoIds, idModalidade);
    }

    async updateStatus(cursoIds: number[], ativo: boolean) {
        return await cursosRepository.updateManyStatus(cursoIds, ativo);
    }

    async getUniqueTypes() {
        return await cursosRepository.getUniqueTypes();
    }
}

export default new CursosService();
