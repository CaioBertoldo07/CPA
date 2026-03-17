const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllAdmins = async (req, res) => {
    try {
        const admins = await prisma.admin.findMany();
        res.status(200).json(admins);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar admins', error });
    }
};

const postAdmin = async (req, res) => {
    try {
        const { email, nome } = req.body;
        const newAdmin = await prisma.admin.create({
            data: {
                email,
                nome,
            },
        });
        res.status(201).json(newAdmin);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao cadastrar admin', error });
    }
};

const updateAdmin = async (req, res) => {
    const { id } = req.params;
    const { email, nome } = req.body;

    try {
        const updatedAdmin = await prisma.admin.update({
            where: { id: Number(id) },
            data: {
                email,
                nome,
            },
        });
        res.status(200).json(updatedAdmin);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar admin', error });
    }
};

const deleteAdmin = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.admin.delete({
            where: { id: Number(id) },
        });
        res.status(204).json({ message: 'Admin deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar admin', error });
    }
};

module.exports = {
    getAllAdmins,
    postAdmin,
    updateAdmin,
    deleteAdmin,
};
