FROM node:20

WORKDIR /app

# Copia o package.json e instala dependências
COPY package.json ./
RUN npm install --force

# Copia o restante dos arquivos e constrói o app
COPY . .
RUN npm run build

# Instala "serve" globalmente e define o comando padrão para rodar o servidor
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-l", "3050"]