process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-with-at-least-32-chars';
process.env.LYCEUM_CONSUMER_EMAIL = 'test@example.com';
process.env.LYCEUM_CONSUMER_PASSWORD = 'test-password';

export const prismaMock = {
    avaliacao: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
    },
    avaliacao_questoes: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
    },
    respostas: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
    },
    respostasGrade: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
    },
    alternativas: {
        findUnique: jest.fn(),
    },
    questoes: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
    },
    unidades: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
    },
    cursos: {
        findMany: jest.fn(),
    },
    categorias: {
        findMany: jest.fn(),
    },
    modalidades: {
        findMany: jest.fn(),
    },
    solicitacaoCeticLog: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
    $queryRaw: jest.fn(),
    $disconnect: jest.fn(),
};

jest.mock('../src/repositories/prismaClient', () => ({
    __esModule: true,
    default: prismaMock,
}));

jest.mock('../src/services/lyceumService', () => {
    return {
        __esModule: true,
        default: jest.fn().mockImplementation(() => ({
            getAlunoInfo: jest.fn(),
            getUnidadeCursos: jest.fn(),
            getConsumerJwtToken: jest.fn(),
        })),
    };
});
