# Use a imagem oficial do Node.js como base
FROM node:20-alpine

# Defina o diretório de trabalho dentro do container
WORKDIR /app

# Instale as dependências separando o processo de cópia
COPY package.json ./

# Instale as dependências incluindo devDependencies
RUN npm install

# Copie o restante do código da aplicação
COPY . .

RUN npx prisma generate
RUN npm run build

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

# Expõe a porta da aplicação
EXPOSE 3034

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
	CMD wget -qO- http://127.0.0.1:3034/health >/dev/null 2>&1 || exit 1

# Comando modificado para garantir a inicialização correta
CMD ["sh", "-c", "npm run migrate && npm start"]