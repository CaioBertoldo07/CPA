import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Migrando dados de modalidade para curso_tipo...');
    const result = await prisma.$executeRaw`UPDATE "Cursos" SET "curso_tipo" = "modalidade" WHERE "curso_tipo" IS NULL`;
    console.log(`Sucesso! ${result} linhas atualizadas.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
