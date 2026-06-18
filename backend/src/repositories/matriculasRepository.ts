import prisma from './prismaClient';

export interface SnapshotInput {
    ano: string;
    semestre: string;
    und: string;
    und_tipo?: string | null;
    und_municipio?: string | null;
    curso_codigo: string;
    curso_nome: string;
    curso_tipo?: string | null;
    qt_matricula: number;
    fonte?: string;
}

/**
 * Insere/atualiza um snapshot de matriculados pela chave
 * (ano, semestre, curso_codigo, und). Idempotente por periodo.
 */
export async function upsertSnapshot(row: SnapshotInput) {
    return prisma.matriculasSnapshot.upsert({
        where: {
            matricula_periodo_curso_und: {
                ano: row.ano,
                semestre: row.semestre,
                curso_codigo: row.curso_codigo,
                und: row.und,
            },
        },
        create: {
            ano: row.ano,
            semestre: row.semestre,
            und: row.und,
            und_tipo: row.und_tipo ?? null,
            und_municipio: row.und_municipio ?? null,
            curso_codigo: row.curso_codigo,
            curso_nome: row.curso_nome,
            curso_tipo: row.curso_tipo ?? null,
            qt_matricula: row.qt_matricula,
            fonte: row.fonte ?? 'LYCEUM',
            capturado_em: new Date(),
        },
        update: {
            und_tipo: row.und_tipo ?? null,
            und_municipio: row.und_municipio ?? null,
            curso_nome: row.curso_nome,
            curso_tipo: row.curso_tipo ?? null,
            qt_matricula: row.qt_matricula,
            fonte: row.fonte ?? 'LYCEUM',
            capturado_em: new Date(),
        },
    });
}

export async function upsertMany(rows: SnapshotInput[]) {
    let count = 0;
    for (const row of rows) {
        await upsertSnapshot(row);
        count += 1;
    }
    return count;
}

export async function findByPeriodo(ano: string, semestre?: string) {
    return prisma.matriculasSnapshot.findMany({
        where: { ano, ...(semestre ? { semestre } : {}) },
    });
}

/**
 * Total de matriculados do periodo capturado mais recentemente.
 * Retorna null se ainda nao houver snapshot.
 */
export async function getLatestPeriodoTotal(): Promise<
    { ano: string; semestre: string; total: number } | null
> {
    const latest = await prisma.matriculasSnapshot.findFirst({
        orderBy: { capturado_em: 'desc' },
    });
    if (!latest) return null;

    const rows = await prisma.matriculasSnapshot.findMany({
        where: { ano: latest.ano, semestre: latest.semestre },
        select: { qt_matricula: true },
    });
    const total = rows.reduce((acc: number, r: { qt_matricula: number }) => acc + r.qt_matricula, 0);
    return { ano: latest.ano, semestre: latest.semestre, total };
}
