const prisma = require('./prismaClient');

/**
 * Busca um admin pelo email
 * @param {string} email
 */
const findByEmail = (email) => {
    return prisma.admin.findUnique({ where: { email } });
};

/**
 * Busca todos os admins
 */
const findAll = () => {
    return prisma.admin.findMany();
};

/**
 * Cria um novo admin
 * @param {{ email: string, nome: string }} data
 */
const create = (data) => {
    return prisma.admin.create({ data });
};

/**
 * Atualiza um admin pelo ID
 * @param {number} id
 * @param {{ email?: string, nome?: string }} data
 */
const update = (id, data) => {
    return prisma.admin.update({ where: { id }, data });
};

/**
 * Remove um admin pelo ID
 * @param {number} id
 */
const remove = (id) => {
    return prisma.admin.delete({ where: { id } });
};

module.exports = { findByEmail, findAll, create, update, remove };
