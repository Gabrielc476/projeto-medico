FROM node:20

WORKDIR /app

# Instalar ferramentas globais
RUN npm install -g expo-cli

# Copiar manifesto de dependências
COPY package*.json ./

# Instalar dependências resolvendo conflitos de peer-deps automaticamente
RUN npm install --legacy-peer-deps

# Copiar todo o código
COPY . .

# Expor porta padrão de desenvolvimento do Metro Bundler
EXPOSE 8081

# Rodar o servidor de desenvolvimento apontando para rede LAN
CMD ["npx", "expo", "start", "--host", "lan"]
