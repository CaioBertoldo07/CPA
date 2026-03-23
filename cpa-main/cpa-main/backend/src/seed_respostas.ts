import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:12345@localhost:5432/cpa?schema=public"
    }
  }
});

async function main() {
  console.log('🌱 Iniciando seeding de respostas...');
  
  // 1. Buscar a primeira avaliação disponível
  const avaliacao = await prisma.avaliacao.findFirst({
    include: {
      avaliacao_questoes: {
        include: {
          questoes: {
            include: {
              padrao_resposta: { include: { alternativas: true } },
              questoes_adicionais: true
            }
          }
        }
      }
    }
  });

  if (!avaliacao) {
    console.log('❌ Nenhuma avaliação encontrada para seedar respostas.');
    return;
  }

  console.log(`✅ Usando Avaliação ID: ${avaliacao.id}`);

  const matriculas = ['MOCK001', 'MOCK002', 'MOCK003', 'MOCK004', 'MOCK005'];
  const data_resposta = new Date();

  for (const matricula of matriculas) {
    console.log(`👤 Gerando respostas para o avaliador: ${matricula}`);
    
    for (const aq of avaliacao.avaliacao_questoes) {
      if (!aq.questoes) continue;

      const alternativas = aq.questoes.padrao_resposta?.alternativas || [];
      if (alternativas.length === 0) continue;

      if (aq.questoes.id_questoes_tipo === 2) { // Grade
        for (const adicional of aq.questoes.questoes_adicionais) {
          // Escolher uma alternativa aleatória
          const alt = alternativas[Math.floor(Math.random() * alternativas.length)];
          
          await prisma.respostasGrade.create({
            data: {
              id_avaliacao_questoes: aq.id,
              adicionalId: adicional.id,
              resposta: alt.descricao,
              avaliador_matricula: matricula,
              data_resposta
            }
          });
        }
      } else { // Padrão
        const alt = alternativas[Math.floor(Math.random() * alternativas.length)];
        
        await prisma.respostas.create({
          data: {
            id_avaliacao_questoes: aq.id,
            resposta: alt.descricao,
            avaliador_matricula: matricula,
            data_resposta
          }
        });
      }
    }
  }

  console.log('✨ Seeding de respostas concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
