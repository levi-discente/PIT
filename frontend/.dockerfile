# Imagem base Node.js
FROM node:20-alpine

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de configuração
COPY package.json package-lock.json ./

# Instala as dependências
RUN npm install

# Copia o resto dos arquivos do projeto
COPY . .

# Constrói a aplicação
RUN npm run build

# Expõe a porta 3000 (padrão do Next.js)
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
