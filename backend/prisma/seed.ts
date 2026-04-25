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

    // 2. Tipos de Questão (Essencial para o sistema)
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
    console.log('✅ Tipos de questões inseridos.');

    // 3. Categorias fixas — DISCENTE, DOCENTE, TÉCNICO (somente leitura na UI)
    const categoriasFixas = ['DISCENTE', 'DOCENTE', 'TÉCNICO'];
    for (const nomeCategoria of categoriasFixas) {
        // Verifica se já existe pelo nome
        const existing = await prisma.categorias.findFirst({ where: { nome: nomeCategoria } });
        if (existing) {
            // Garante que o nome está correto (maiúsculo com acento)
            if (existing.nome !== nomeCategoria) {
                await prisma.categorias.update({ where: { id: existing.id }, data: { nome: nomeCategoria } });
                console.log(`  ~ Categoria atualizada: "${nomeCategoria}"`);
            }
        } else {
            await prisma.categorias.create({ data: { nome: nomeCategoria } });
            console.log(`  + Categoria criada: "${nomeCategoria}"`);
        }
    }
    console.log('✅ Categorias fixas verificadas/inseridas (DISCENTE, DOCENTE, TÉCNICO).');

    // 4. Carregar dados do database.json
    const dataPath = path.join(__dirname, 'database.json');
    if (fs.existsSync(dataPath)) {
        const rawData = fs.readFileSync(dataPath, 'utf-8');
        const data = JSON.parse(rawData);

        // Categorias — nomes fixos e imutáveis (DISCENTE, DOCENTE, TÉCNICO)
        // Não utiliza mais o database.json para categorias; nomes definidos aqui diretamente.
        // Ignorado: data.categorias do database.json


        //     // Eixos
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

        //     // Dimensoes
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
        console.warn('⚠️ prisma/database.json não encontrado.');
    }

    console.log('📋 Inserindo modalidades...');

    const modalidadesData = [
        { mod_ensino: 'REGULAR', mod_oferta: 'Presencial', num_questoes: 0 },
        { mod_ensino: 'PARFOR', mod_oferta: 'Presencial', num_questoes: 0 },
    ];

    const modalidadeMap: Record<string, number> = {};

    for (const mod of modalidadesData) {
        const record = await prisma.modalidades.upsert({
            where: { mod_ensino: mod.mod_ensino },
            update: { mod_oferta: mod.mod_oferta },
            create: {
                mod_ensino: mod.mod_ensino,
                mod_oferta: mod.mod_oferta,
                num_questoes: mod.num_questoes,
            },
        });
        modalidadeMap[mod.mod_ensino] = record.id;
    }
    console.log(`✅ Modalidades inseridas: ${Object.keys(modalidadeMap).join(', ')}`);

    console.log('📝 Inserindo padrões de resposta...');

    type PadraoSeed = {
        sigla: string;
        alternativas: string[];
    };

    const padroesSeed: PadraoSeed[] = [
        { sigla: 'SIMNAO', alternativas: ['Sim', 'Não'] },
        { sigla: 'CONC', alternativas: ['Discordo', 'Neutro', 'Concordo'] },
        { sigla: 'ESC', alternativas: ['Baixa', 'Média', 'Alta'] },
    ];

    const padraoMap: Record<string, number> = {};

    for (const padrao of padroesSeed) {
        // findFirst porque sigla não é unique no schema
        let padraoRecord = await prisma.padrao_resposta.findFirst({
            where: { sigla: padrao.sigla },
            include: { alternativas: true },
        });

        if (!padraoRecord) {
            padraoRecord = await prisma.padrao_resposta.create({
                data: { sigla: padrao.sigla },
                include: { alternativas: true },
            });
            console.log(`  + Padrão criado: ${padrao.sigla}`);
        }

        padraoMap[padrao.sigla] = padraoRecord.id;

        // Criar alternativas que ainda não existem para este padrão
        const existingDescricoes = padraoRecord.alternativas.map((a: { descricao: any; }) => a.descricao);
        for (const descricao of padrao.alternativas) {
            if (!existingDescricoes.includes(descricao)) {
                await prisma.alternativas.create({
                    data: {
                        descricao,
                        id_padrao_resp: padraoRecord.id,
                    },
                });
                console.log(`    + Alternativa criada: "${descricao}" para padrão ${padrao.sigla}`);
            }
        }
    }
    console.log('✅ Padrões de resposta e alternativas inseridos.');

    // // -------------------------------------------------------------------------
    // // 9. Questões
    // // -------------------------------------------------------------------------
    console.log('❓ Inserindo questões...');

    // Buscar IDs das categorias seedadas
    const catDiscente = await prisma.categorias.findFirst({ where: { nome: 'DISCENTE' } });
    const catDocente = await prisma.categorias.findFirst({ where: { nome: 'DOCENTE' } });
    const catTecnico = await prisma.categorias.findFirst({ where: { nome: 'TÉCNICO' } });

    if (!catDiscente || !catDocente || !catTecnico) {
        console.warn('⚠️ Uma ou mais categorias não encontradas. Verifique o database.json.');
    }

    type QuestaoSeed = {
        descricao: string;
        basica: boolean;
        padrao_sigla: string;
        tipo_id: number;
        dimensao_numero: number;
        categorias_ids: number[];
        modalidades_ensino: string[];
        adicionais?: string[];
    };

    const questoesSeed: QuestaoSeed[] = [
        {
            descricao: 'Como você avalia a qualidade do ensino oferecido pelo seu curso?',
            basica: true,
            padrao_sigla: 'ESC',
            tipo_id: 1,
            dimensao_numero: 2,
            categorias_ids: [catDiscente?.id].filter(Boolean) as number[],
            modalidades_ensino: ['REGULAR'],
        },
        {
            descricao: 'Você está satisfeito com a infraestrutura física disponível na unidade?',
            basica: true,
            padrao_sigla: 'CONC',
            tipo_id: 1,
            dimensao_numero: 7,
            categorias_ids: [catDiscente?.id, catDocente?.id].filter(Boolean) as number[],
            modalidades_ensino: ['REGULAR', 'PARFOR'],
        },
        {
            descricao: 'A instituição promove ações de responsabilidade social e extensão?',
            basica: false,
            padrao_sigla: 'SIMNAO',
            tipo_id: 1,
            dimensao_numero: 3,
            categorias_ids: [catDocente?.id, catTecnico?.id].filter(Boolean) as number[],
            modalidades_ensino: ['REGULAR'],
        },
        {
            descricao: 'Avalie os aspectos abaixo relacionados ao atendimento ao discente:',
            basica: true,
            padrao_sigla: 'ESC',
            tipo_id: 2,
            dimensao_numero: 9,
            categorias_ids: [catDiscente?.id].filter(Boolean) as number[],
            modalidades_ensino: ['REGULAR', 'PARFOR'],
            adicionais: [
                'Agilidade no atendimento',
                'Cortesia dos servidores',
                'Clareza nas informações fornecidas',
            ],
        },
    ];

    for (const q of questoesSeed) {
        const padraoId = padraoMap[q.padrao_sigla];
        if (!padraoId) {
            console.warn(`⚠️ Padrão "${q.padrao_sigla}" não encontrado. Questão ignorada.`);
            continue;
        }

        // Verificar idempotência por combinação estável
        const existing = await prisma.questoes.findFirst({
            where: {
                descricao: q.descricao,
                id_padrao_resposta: padraoId,
                numero_dimensoes: q.dimensao_numero,
                basica: q.basica,
            },
        });

        if (existing) {
            console.log(`  ~ Questão já existe, pulando: "${q.descricao.substring(0, 50)}..."`);
            continue;
        }

        const modalidadeIds = q.modalidades_ensino
            .map((me) => modalidadeMap[me])
            .filter(Boolean) as number[];

        const questao = await prisma.questoes.create({
            data: {
                descricao: q.descricao,
                basica: q.basica,
                id_padrao_resposta: padraoId,
                id_questoes_tipo: q.tipo_id,
                numero_dimensoes: q.dimensao_numero,
                Questoes_categorias: {
                    create: q.categorias_ids.map((id_categorias) => ({ id_categorias })),
                },
                questoes_modalidades: {
                    create: modalidadeIds.map((id_modalidades) => ({ id_modalidades })),
                },
                questoes_adicionais: q.adicionais
                    ? {
                        create: q.adicionais.map((descricao) => ({ descricao })),
                    }
                    : undefined,
            },
        });
        console.log(`  + Questão criada (id=${questao.id}): "${q.descricao.substring(0, 60)}"`);
    }
    console.log('✅ Questões inseridas.');

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
