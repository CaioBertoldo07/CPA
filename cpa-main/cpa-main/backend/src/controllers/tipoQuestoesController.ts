import { Request, Response } from 'express';
import * as tipoQuestoesRepository from '../repositories/tipoQuestoesRepository';

// Função para buscar todos os tipos de questões
const getTipoQuestoes = async (req: Request, res: Response) => {
    try {
        const tipos = await tipoQuestoesRepository.findAll();
        return res.status(200).json(tipos);
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ message: "Erro ao buscar tipos de questões", error });
    }
};

export {
    getTipoQuestoes,
};
