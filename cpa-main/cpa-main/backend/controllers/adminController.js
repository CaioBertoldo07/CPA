const adminRepository = require('../repositories/adminRepository');

const getAllAdmins = async (req, res) => {
    try {
        const admins = await adminRepository.findAll();
        res.status(200).json(admins);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar admins', error });
    }
};

const postAdmin = async (req, res) => {
    try {
        const { email, nome } = req.body;
        const newAdmin = await adminRepository.create({ email, nome });
        res.status(201).json(newAdmin);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao cadastrar admin', error });
    }
};

const updateAdmin = async (req, res) => {
    const { id } = req.params;
    const { email, nome } = req.body;

    try {
        const updatedAdmin = await adminRepository.update(Number(id), { email, nome });
        res.status(200).json(updatedAdmin);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar admin', error });
    }
};

const deleteAdmin = async (req, res) => {
    const { id } = req.params;

    try {
        await adminRepository.remove(Number(id));
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
