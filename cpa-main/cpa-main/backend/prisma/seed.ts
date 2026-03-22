import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando seeding...');

    const adminNome = process.env.ADMIN_NAME || 'Admin';
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@teste.com').trim().toLowerCase();

    // 1. Inserir Admin padrão
    await prisma.$executeRaw`
    INSERT INTO "Admin" (nome, email) 
    VALUES (${adminNome}, ${adminEmail}) 
    ON CONFLICT DO NOTHING
  `;
    console.log('✅ Admin inserido com sucesso!');

    // 2. Tipos de Questão (1: Múltipla Escolha, 2: Tipo Grade)
    const tiposQuestoes = [
        { id: 1, descricao: 'Múltipla Escolha' },
        { id: 2, descricao: 'Tipo Grade' }
    ];

    for (const tipo of tiposQuestoes) {
        await prisma.$executeRaw`
      INSERT INTO "Questoes_tipo" (id, descricao) 
      VALUES (${tipo.id}, ${tipo.descricao}) 
      ON CONFLICT (id) DO UPDATE SET descricao = EXCLUDED.descricao
    `;
    }
    console.log('✅ Tipos de questões (Múltipla Escolha/Grade) inseridos.');

    // 3. Carregar dados do database.json
    const dataPath = path.join(__dirname, 'database.json');
    if (fs.existsSync(dataPath)) {
        const rawData = fs.readFileSync(dataPath, 'utf-8');
        const data = JSON.parse(rawData);

        // Categorias
        if (data.categorias) {
            for (const cat of data.categorias) {
                await prisma.$executeRaw`
          INSERT INTO "Categorias" (nome) 
          VALUES (${cat.nome}) 
          ON CONFLICT DO NOTHING
        `;
            }
            console.log('✅ Categorias inseridas.');
        }

        // Eixos
        if (data.eixos) {
            for (const eixo of data.eixos) {
                await prisma.$executeRaw`
          INSERT INTO "Eixos" (numero, nome) 
          VALUES (${eixo.numero}, ${eixo.nome}) 
          ON CONFLICT (numero) DO UPDATE SET nome = EXCLUDED.nome
        `;
            }
            console.log('✅ Eixos inseridos.');
        }

        // Dimensoes
        if (data.dimensoes) {
            for (const dim of data.dimensoes) {
                await prisma.$executeRaw`
          INSERT INTO "Dimensoes" (numero, nome, numero_eixos) 
          VALUES (${dim.numero}, ${dim.nome}, ${dim.numero_eixos}) 
          ON CONFLICT (numero) DO UPDATE SET nome = EXCLUDED.nome, numero_eixos = EXCLUDED.numero_eixos
        `;
            }
            console.log('✅ Dimensões inseridas.');
        }
    } else {
        console.warn('⚠️ database.json não encontrado em prisma/database.json');
    }

    // 4. Sincronizar Sequências do PostgreSQL (ID manual fix)
    console.log('🔄 Sincronizando sequências do PostgreSQL...');
    const tables = [
        'Questoes_tipo',
        'Questoes',
        'QuestoesAdicionais',
        'Padrao_resposta',
        'Alternativas',
        'Modalidades',
        'Questoes_modalidades',
        'Categorias',
        'Questoes_categorias',
        'Unidades',
        'Cursos',
        'Municipios',
        'Avaliacao',
        'Avaliacao_questoes',
        'Respostas',
        'RespostasGrade',
        'Questoes_alternativas'
    ];

    for (const table of tables) {
        try {
            await prisma.$executeRawUnsafe(`
        SELECT setval(
          pg_get_serial_sequence('"${table}"', 'id'),
          COALESCE((SELECT MAX(id) FROM "${table}"), 0) + 1,
          false
        );
      `);
        } catch (e) {
            // Ignorar tabelas sem sequence ou ID serial
        }
    }

    console.log('✨ Seeding concluído com sucesso!');
}

main()
    .catch((e) => {
        console.error('❌ Erro no seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
