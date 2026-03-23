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
        console.warn('⚠️ prisma/database.json não encontrado.');
    }

    // -------------------------------------------------------------------------
    // 4. Municípios com presença da UEA
    // -------------------------------------------------------------------------
    console.log('🏙️ Inserindo municípios...');

    const municipiosData = [
        { nome: 'Manaus', UF: 'AM' },
        { nome: 'Coari', UF: 'AM' },
        { nome: 'Parintins', UF: 'AM' },
        { nome: 'Tefé', UF: 'AM' },
        { nome: 'Apuí', UF: 'AM' },
        { nome: 'Tapauá', UF: 'AM' },
        { nome: 'Itacoatiara', UF: 'AM' },
        { nome: 'Iranduba', UF: 'AM' },
    ];

    const municipioMap: Record<string, number> = {};

    for (const mun of municipiosData) {
        const record = await prisma.municipios.upsert({
            where: { nome: mun.nome },
            update: { UF: mun.UF },
            create: { nome: mun.nome, UF: mun.UF },
        });
        municipioMap[mun.nome] = record.id;
    }
    console.log(`✅ Municípios inseridos: ${Object.keys(municipioMap).join(', ')}`);

    // -------------------------------------------------------------------------
    // 5. Unidades da UEA
    // -------------------------------------------------------------------------
    console.log('🏫 Inserindo unidades...');

    const unidadesData = [
        // Manaus - Capital
        { nome: 'Escola Superior de Ciências Sociais', sigla: 'ESO', municipio_vinculo: 'Manaus' },
        { nome: 'Escola Superior de Ciências da Saúde', sigla: 'ESA', municipio_vinculo: 'Manaus' },
        { nome: 'Escola Normal Superior', sigla: 'ENS', municipio_vinculo: 'Manaus' },
        { nome: 'Escola de Direito', sigla: 'ED', municipio_vinculo: 'Manaus' },
        { nome: 'Escola Superior de Artes e Turismo', sigla: 'ESAT', municipio_vinculo: 'Manaus' },
        { nome: 'Escola Superior de Tecnologia', sigla: 'EST', municipio_vinculo: 'Manaus' },
        // Interior
        { nome: 'Núcleo de Ensino Superior de Coari', sigla: 'COARI', municipio_vinculo: 'Coari' },
        { nome: 'Centro de Estudos Superiores de Parintins', sigla: 'PARINTS', municipio_vinculo: 'Parintins' },
        { nome: 'Casa do Estudante de Tefé', sigla: 'TEFE', municipio_vinculo: 'Tefé' },
        { nome: 'Núcleo de Ensino Superior de Apuí', sigla: 'APUI', municipio_vinculo: 'Apuí' },
        { nome: 'Núcleo de Ensino Superior de Tapauá', sigla: 'TAPUA', municipio_vinculo: 'Tapauá' },
        { nome: 'Polo Rural de Novo Remanso', sigla: 'NREM', municipio_vinculo: 'Itacoatiara' },
        { nome: 'Cidade Universitária de Iranduba', sigla: 'IRAND', municipio_vinculo: 'Iranduba' },
    ];

    const unidadeMap: Record<string, number> = {};

    for (const uni of unidadesData) {
        const record = await prisma.unidades.upsert({
            where: { sigla: uni.sigla },
            update: { nome: uni.nome, municipio_vinculo: uni.municipio_vinculo },
            create: { nome: uni.nome, sigla: uni.sigla, municipio_vinculo: uni.municipio_vinculo },
        });
        unidadeMap[uni.sigla] = record.id;
    }
    console.log(`✅ Unidades inseridas: ${Object.keys(unidadeMap).join(', ')}`);

    // -------------------------------------------------------------------------
    // 6. Modalidades
    // -------------------------------------------------------------------------
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

    // -------------------------------------------------------------------------
    // 7. Cursos (>= 2 por unidade)
    // -------------------------------------------------------------------------
    console.log('🎓 Inserindo cursos...');

    type CursoSeed = {
        identificador_api_lyceum: string;
        nome: string;
        nivel: string;
        municipio_nome: string;
        unidade_sigla: string;
        modalidade: string;
        modalidade_api: string;
    };

    const cursosData: CursoSeed[] = [
        // ESO - Manaus
        { identificador_api_lyceum: 'ESO-CIENCIAS-SOCIAIS-001', nome: 'Ciências Sociais', nivel: 'GRAD', municipio_nome: 'Manaus', unidade_sigla: 'ESO', modalidade: 'REGULAR', modalidade_api: 'BA' },
        { identificador_api_lyceum: 'ESO-GESTAO-PUBLICA-001', nome: 'Gestão Pública', nivel: 'GRAD', municipio_nome: 'Manaus', unidade_sigla: 'ESO', modalidade: 'REGULAR', modalidade_api: 'BA' },
        // ESA - Manaus
        { identificador_api_lyceum: 'ESA-ENFERMAGEM-001', nome: 'Enfermagem', nivel: 'GRAD', municipio_nome: 'Manaus', unidade_sigla: 'ESA', modalidade: 'REGULAR', modalidade_api: 'BA' },
        { identificador_api_lyceum: 'ESA-MEDICINA-001', nome: 'Medicina', nivel: 'GRAD', municipio_nome: 'Manaus', unidade_sigla: 'ESA', modalidade: 'REGULAR', modalidade_api: 'BA' },
        // ENS - Manaus
        { identificador_api_lyceum: 'ENS-PEDAGOGIA-001', nome: 'Pedagogia', nivel: 'GRAD', municipio_nome: 'Manaus', unidade_sigla: 'ENS', modalidade: 'REGULAR', modalidade_api: 'BA' },
        { identificador_api_lyceum: 'ENS-LETRAS-001', nome: 'Letras - Língua Portuguesa', nivel: 'GRAD', municipio_nome: 'Manaus', unidade_sigla: 'ENS', modalidade: 'REGULAR', modalidade_api: 'BA' },
        // ED - Manaus
        { identificador_api_lyceum: 'ED-DIREITO-DIURNO-001', nome: 'Direito (Diurno)', nivel: 'GRAD', municipio_nome: 'Manaus', unidade_sigla: 'ED', modalidade: 'REGULAR', modalidade_api: 'BA' },
        { identificador_api_lyceum: 'ED-DIREITO-NOTURNO-001', nome: 'Direito (Noturno)', nivel: 'GRAD', municipio_nome: 'Manaus', unidade_sigla: 'ED', modalidade: 'REGULAR', modalidade_api: 'BA' },
        // ESAT - Manaus
        { identificador_api_lyceum: 'ESAT-ARTES-VISUAIS-001', nome: 'Artes Visuais', nivel: 'GRAD', municipio_nome: 'Manaus', unidade_sigla: 'ESAT', modalidade: 'REGULAR', modalidade_api: 'BA' },
        { identificador_api_lyceum: 'ESAT-TURISMO-001', nome: 'Turismo', nivel: 'GRAD', municipio_nome: 'Manaus', unidade_sigla: 'ESAT', modalidade: 'REGULAR', modalidade_api: 'BA' },
        // EST - Manaus
        { identificador_api_lyceum: 'EST-ENG-CIVIL-001', nome: 'Engenharia Civil', nivel: 'GRAD', municipio_nome: 'Manaus', unidade_sigla: 'EST', modalidade: 'REGULAR', modalidade_api: 'BA' },
        { identificador_api_lyceum: 'EST-ENG-COMPUTAÇÃO-001', nome: 'Engenharia de Computação', nivel: 'GRAD', municipio_nome: 'Manaus', unidade_sigla: 'EST', modalidade: 'REGULAR', modalidade_api: 'BA' },
        // COARI
        { identificador_api_lyceum: 'COARI-ADM-001', nome: 'Administração', nivel: 'GRAD', municipio_nome: 'Coari', unidade_sigla: 'COARI', modalidade: 'REGULAR', modalidade_api: 'BA' },
        { identificador_api_lyceum: 'COARI-LETRAS-001', nome: 'Letras - Língua Portuguesa', nivel: 'GRAD', municipio_nome: 'Coari', unidade_sigla: 'COARI', modalidade: 'REGULAR', modalidade_api: 'BA' },
        // PARINTS
        { identificador_api_lyceum: 'PARINTS-LETRAS-001', nome: 'Letras - Língua Portuguesa', nivel: 'GRAD', municipio_nome: 'Parintins', unidade_sigla: 'PARINTS', modalidade: 'REGULAR', modalidade_api: 'BA' },
        { identificador_api_lyceum: 'PARINTS-PEDAGOGIA-001', nome: 'Pedagogia', nivel: 'GRAD', municipio_nome: 'Parintins', unidade_sigla: 'PARINTS', modalidade: 'REGULAR', modalidade_api: 'BA' },
        // TEFE
        { identificador_api_lyceum: 'TEFE-ADM-001', nome: 'Administração', nivel: 'GRAD', municipio_nome: 'Tefé', unidade_sigla: 'TEFE', modalidade: 'REGULAR', modalidade_api: 'BA' },
        { identificador_api_lyceum: 'TEFE-LETRAS-001', nome: 'Letras - Língua Portuguesa', nivel: 'GRAD', municipio_nome: 'Tefé', unidade_sigla: 'TEFE', modalidade: 'REGULAR', modalidade_api: 'BA' },
        // APUI
        { identificador_api_lyceum: 'APUI-LETRAS-001', nome: 'Letras - Língua Portuguesa', nivel: 'GRAD', municipio_nome: 'Apuí', unidade_sigla: 'APUI', modalidade: 'REGULAR', modalidade_api: 'BA' },
        { identificador_api_lyceum: 'APUI-ADM-001', nome: 'Administração', nivel: 'GRAD', municipio_nome: 'Apuí', unidade_sigla: 'APUI', modalidade: 'REGULAR', modalidade_api: 'BA' },
        // TAPUA
        { identificador_api_lyceum: 'TAPUA-LETRAS-001', nome: 'Letras - Língua Portuguesa', nivel: 'GRAD', municipio_nome: 'Tapauá', unidade_sigla: 'TAPUA', modalidade: 'REGULAR', modalidade_api: 'BA' },
        { identificador_api_lyceum: 'TAPUA-PEDAGOGIA-001', nome: 'Pedagogia', nivel: 'GRAD', municipio_nome: 'Tapauá', unidade_sigla: 'TAPUA', modalidade: 'REGULAR', modalidade_api: 'BA' },
        // NREM (Novo Remanso - municipio_vinculo = Itacoatiara)
        { identificador_api_lyceum: 'NREM-LETRAS-001', nome: 'Letras - Língua Portuguesa', nivel: 'GRAD', municipio_nome: 'Itacoatiara', unidade_sigla: 'NREM', modalidade: 'REGULAR', modalidade_api: 'BA' },
        { identificador_api_lyceum: 'NREM-ADM-001', nome: 'Administração', nivel: 'GRAD', municipio_nome: 'Itacoatiara', unidade_sigla: 'NREM', modalidade: 'REGULAR', modalidade_api: 'BA' },
        // IRAND
        { identificador_api_lyceum: 'IRAND-ENG-PROD-001', nome: 'Engenharia de Produção', nivel: 'GRAD', municipio_nome: 'Iranduba', unidade_sigla: 'IRAND', modalidade: 'REGULAR', modalidade_api: 'BA' },
        { identificador_api_lyceum: 'IRAND-ADM-001', nome: 'Administração', nivel: 'GRAD', municipio_nome: 'Iranduba', unidade_sigla: 'IRAND', modalidade: 'REGULAR', modalidade_api: 'BA' },
    ];

    for (const curso of cursosData) {
        const municipioId = municipioMap[curso.municipio_nome];
        const unidadeId = unidadeMap[curso.unidade_sigla];

        if (!municipioId) {
            console.warn(`⚠️ Município não encontrado para curso: ${curso.nome} (${curso.municipio_nome})`);
            continue;
        }
        if (!unidadeId) {
            console.warn(`⚠️ Unidade não encontrada para curso: ${curso.nome} (${curso.unidade_sigla})`);
            continue;
        }

        await prisma.cursos.upsert({
            where: { identificador_api_lyceum: curso.identificador_api_lyceum },
            update: {
                nome: curso.nome,
                nivel: curso.nivel,
                municipio_sede: municipioId,
                id_unidades: unidadeId,
                modalidade: curso.modalidade,
                modalidade_api: curso.modalidade_api,
            },
            create: {
                identificador_api_lyceum: curso.identificador_api_lyceum,
                nome: curso.nome,
                nivel: curso.nivel,
                municipio_sede: municipioId,
                id_unidades: unidadeId,
                modalidade: curso.modalidade,
                modalidade_api: curso.modalidade_api,
            },
        });
    }
    console.log(`✅ Cursos inseridos: ${cursosData.length} curso(s) processado(s).`);

    // -------------------------------------------------------------------------
    // 8. Padrões de Resposta + Alternativas
    // -------------------------------------------------------------------------
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
        const existingDescricoes = padraoRecord.alternativas.map((a) => a.descricao);
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

    // -------------------------------------------------------------------------
    // 9. Questões
    // -------------------------------------------------------------------------
    console.log('❓ Inserindo questões...');

    // Buscar IDs das categorias seedadas
    const catProfessor = await prisma.categorias.findFirst({ where: { nome: 'Professor' } });
    const catTecnico = await prisma.categorias.findFirst({ where: { nome: 'Tecnico' } });
    const catAluno = await prisma.categorias.findFirst({ where: { nome: 'Aluno' } });

    if (!catProfessor || !catTecnico || !catAluno) {
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
            categorias_ids: [catAluno?.id].filter(Boolean) as number[],
            modalidades_ensino: ['REGULAR'],
        },
        {
            descricao: 'Você está satisfeito com a infraestrutura física disponível na unidade?',
            basica: true,
            padrao_sigla: 'CONC',
            tipo_id: 1,
            dimensao_numero: 7,
            categorias_ids: [catAluno?.id, catProfessor?.id].filter(Boolean) as number[],
            modalidades_ensino: ['REGULAR', 'PARFOR'],
        },
        {
            descricao: 'A instituição promove ações de responsabilidade social e extensão?',
            basica: false,
            padrao_sigla: 'SIMNAO',
            tipo_id: 1,
            dimensao_numero: 3,
            categorias_ids: [catProfessor?.id, catTecnico?.id].filter(Boolean) as number[],
            modalidades_ensino: ['REGULAR'],
        },
        {
            descricao: 'Avalie os aspectos abaixo relacionados ao atendimento ao discente:',
            basica: true,
            padrao_sigla: 'ESC',
            tipo_id: 2,
            dimensao_numero: 9,
            categorias_ids: [catAluno?.id].filter(Boolean) as number[],
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
