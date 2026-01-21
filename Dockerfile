# Etapa 1: Build
FROM node:20 AS builder

WORKDIR /app

# Copia e instala dependencias
COPY package.json package-lock.json ./
RUN npm install

# Copia el código y construye
COPY . .
RUN npm run build

# Verifica que dist existe
RUN ls -la /app/dist

# Etapa 2: Producción
FROM node:20-slim

WORKDIR /app

# Instala serve globalmente
RUN npm install -g serve

# Copia SOLO la carpeta dist desde la etapa de build
COPY --from=builder /app/dist ./dist

# Verifica que dist se copió correctamente
RUN ls -la /app/dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]