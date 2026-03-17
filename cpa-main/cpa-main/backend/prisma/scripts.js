require('dotenv').config();
const fs = require('fs'); // Para ler o arquivo JSON
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const adminNome = process.env.ADMIN_NAME;
    const adminEmail = process.env.ADMIN_EMAIL;

    await prisma.$executeRaw`
    INSERT INTO "Admin" (nome, email) 
    VALUES (${adminNome}, ${adminEmail}) 
    ON CONFLICT DO NOTHING
  `;

    console.log("Admin inserido com sucesso!");

    // Lendo o arquivo JSON com os dados
    const rawData = fs.readFileSync('prisma/database.json');
    const data = JSON.parse(rawData);

    for (const categoria of data.categorias) {
        await prisma.$executeRaw`
        INSERT INTO "Categorias" (nome) 
        VALUES (${categoria.nome}) 
        ON CONFLICT DO NOTHING
      `;

    }

    console.log(`Categorias inseridas com sucesso!`);

    for (const eixo of data.eixos) {
        await prisma.$executeRaw`
        INSERT INTO "Eixos" (numero, nome) 
        VALUES (${eixo.numero}, ${eixo.nome}) 
        ON CONFLICT DO NOTHING
      `;

    }

    console.log(`Eixos inseridos com sucesso!`);

    for (const dimensao of data.dimensoes) {
        await prisma.$executeRaw`
        INSERT INTO "Dimensoes" (numero, nome, numero_eixos) 
        VALUES (${dimensao.numero}, ${dimensao.nome}, ${dimensao.numero_eixos}) 
        ON CONFLICT DO NOTHING
      `;

    }

    console.log(`Dimensões inseridas com sucesso!`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
