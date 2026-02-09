# 🐳 Docker Setup para Code5 PPP Frontend

Este proyecto incluye una configuración completa de Docker para desarrollo y producción.

## 📋 Prerrequisitos

- Docker instalado (versión 20.10 o superior)
- Docker Compose instalado

## 🚀 Uso Rápido

### Para Producción

```bash
# Ejecutar script automático
./dockerize.sh
```

Este script:
- ✅ Verifica que Docker esté instalado
- ✅ Crea backup opcional del proyecto
- ✅ Limpia contenedores anteriores
- ✅ Construye la imagen optimizada
- ✅ Inicia la aplicación en http://localhost

### Para Desarrollo

```bash
# Iniciar entorno de desarrollo
./dev.sh start

# Ver la aplicación en http://localhost:4200
```

## 📁 Archivos Docker Incluidos

```
📦 Configuración Docker
├── 🐳 Dockerfile              # Imagen de producción (multi-stage)
├── 🔧 Dockerfile.dev          # Imagen para desarrollo
├── ⚙️  docker-compose.yml      # Configuración de producción
├── 🛠️  docker-compose.dev.yml  # Configuración de desarrollo
├── 🚫 .dockerignore           # Archivos excluidos del build
├── 🌐 nginx.conf              # Configuración de Nginx
├── 🎯 dockerize.sh            # Script de automatización
└── 💻 dev.sh                  # Script de desarrollo
```

## 🛠️ Comandos de Desarrollo

```bash
# Comandos del script dev.sh
./dev.sh start    # Iniciar desarrollo con hot-reload
./dev.sh stop     # Detener desarrollo
./dev.sh restart  # Reiniciar desarrollo
./dev.sh logs     # Ver logs en tiempo real
./dev.sh shell    # Acceder al contenedor
./dev.sh build    # Reconstruir imagen
```

## 🎯 Comandos de Producción

```bash
# Después de ejecutar dockerize.sh
docker-compose logs -f    # Ver logs
docker-compose down       # Detener aplicación
docker-compose restart    # Reiniciar aplicación
docker ps                 # Ver estado de contenedores
```

## 📊 Arquitectura Docker

### Producción (Multi-stage build)
```
┌─────────────────┐    ┌──────────────────┐
│   Node.js 18    │    │   Nginx Alpine   │
│   (Build Stage) │───▶│  (Runtime Stage) │
│                 │    │                  │
│ • npm install   │    │ • Serve app      │
│ • ng build      │    │ • Gzip enabled   │
│ • Optimize      │    │ • SPA routing    │
└─────────────────┘    └──────────────────┘
```

### Desarrollo
```
┌─────────────────┐
│   Node.js 18    │
│                 │
│ • Angular CLI   │
│ • Hot reload    │
│ • Live updates  │
└─────────────────┘
```

## 🔧 Configuración

### Nginx (Producción)
- ✅ Compresión Gzip habilitada
- ✅ Cache de archivos estáticos (1 año)
- ✅ Headers de seguridad
- ✅ Soporte para Angular Router (SPA)
- ✅ Proxy API preparado (comentado)

### Variables de Entorno
```bash
# Producción
NODE_ENV=production

# Desarrollo  
NODE_ENV=development
```

## 🛡️ Seguridad

### Headers incluidos:
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `X-Content-Type-Options: nosniff`
- `Content-Security-Policy`

### .dockerignore optimizado:
- ❌ node_modules excluidos
- ❌ Archivos de desarrollo excluidos
- ❌ Logs y archivos temporales excluidos

## 🚨 Troubleshooting

### Error: Puerto 80 ocupado
```bash
# Cambiar puerto en docker-compose.yml
ports:
  - "8080:80"  # Usar puerto 8080
```

### Error: Permisos en scripts
```bash
chmod +x dockerize.sh
chmod +x dev.sh
```

### Error: Docker no encontrado
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose

# Añadir usuario al grupo docker
sudo usermod -aG docker $USER
```

### Ver logs detallados
```bash
docker-compose logs -f frontend
```

## 📈 Optimizaciones Incluidas

- 🚀 **Multi-stage build** - Imagen final pequeña (~50MB)
- ⚡ **Cache de dependencias** - Build más rápido
- 🗜️ **Compresión Gzip** - Transferencia optimizada
- 📦 **Cache de archivos** - Mejor rendimiento
- 🔄 **Health checks** - Monitoreo automático
- 🧹 **Limpieza automática** - Sin archivos innecesarios

## 🤝 Contribución

1. Los scripts incluyen backup automático
2. Todos los cambios son reversibles
3. Logs detallados para debugging
4. Configuración modular y extensible

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs: `docker-compose logs -f`
2. Verifica que Docker esté corriendo: `docker ps`
3. Reinicia los contenedores: `docker-compose restart`
4. Como último recurso: `docker system prune -a` (⚠️ elimina todo)

---

**¡La dockerización de tu proyecto está lista! 🎉**