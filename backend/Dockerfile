# Use a imagem oficial do Node.js como base
FROM node:18

# Defina o diretório de trabalho dentro do container
WORKDIR /app

# Instale as dependências separando o processo de cópia
COPY package.json ./

# Instale as dependências incluindo devDependencies
RUN npm install

# Copie o restante do código da aplicação
COPY . .

RUN npx prisma generate

# Expõe a porta da aplicação
EXPOSE 3034

# Comando modificado para garantir a inicialização correta
CMD ["sh", "-c", "npm run dev"]