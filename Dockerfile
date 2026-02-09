# ===================================
# DOCKERFILE PARA PROYECTO ANGULAR 18
# ===================================

# STAGE 1: BUILD STAGE
FROM node:18-alpine AS build

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json para aprovechar cache de Docker
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production=false

# Copiar el código fuente
COPY . .

# Construir la aplicación para producción
RUN npm run build

# STAGE 2: NGINX STAGE
FROM nginx:alpine

# Copiar los archivos construidos desde el stage anterior
COPY --from=build /app/dist/frontend-app/browser /usr/share/nginx/html

# Copiar configuración personalizada de nginx (opcional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 80
EXPOSE 80

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]