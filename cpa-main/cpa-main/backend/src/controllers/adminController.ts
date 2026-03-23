import { Request, Response } from 'express';
import adminService from '../services/adminService';
import { asyncHandler } from '../middleware/errorMiddleware';

const getAllAdmins = asyncHandler(async (req: Request, res: Response) => {
    const admins = await adminService.getAll();
    res.status(200).json(admins);
});

const postAdmin = asyncHandler(async (req: Request, res: Response) => {
    const email = req.body.email as string;
    const nome = req.body.nome as string;
    if (!email || !nome) return res.status(400).json({ error: 'Email e nome são obrigatórios.' });

    const newAdmin = await adminService.create({ email, nome });
    res.status(201).json({ message: 'Administrador cadastrado com sucesso.', admin: newAdmin });
});

const deleteAdmin = asyncHandler(async (req: Request, res: Response) => {
    const email = req.params.email as string;
    await adminService.delete(email);
    res.status(200).json({ message: 'Administrador removido com sucesso.' });
});

const updateAdmin = asyncHandler(async (req: Request, res: Response) => {
    const email = req.params.email as string;
    const nome = req.body.nome as string;
    const updated = await adminService.update(email, { nome });
    res.status(200).json({ message: 'Administrador atualizado com sucesso.', admin: updated });
});

export {
    getAllAdmins,
    postAdmin,
    deleteAdmin,
    updateAdmin
};
