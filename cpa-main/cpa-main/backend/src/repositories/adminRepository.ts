import { Prisma } from '@prisma/client';
import prisma from './prismaClient';

/**
 * Busca um admin pelo email
 */
const findByEmail = (email: string) => {
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
 */
const create = (data: Prisma.AdminCreateInput) => {
    return prisma.admin.create({ data });
};

/**
 * Atualiza um admin pelo ID
 */
const update = (id: number, data: Prisma.AdminUpdateInput) => {
    return prisma.admin.update({ where: { id }, data });
};

/**
 * Remove um admin pelo ID
 */
const remove = (id: number) => {
    return prisma.admin.delete({ where: { id } });
};

export { findByEmail, findAll, create, update, remove };
