# 🚀 Code5 PPP Frontend - Guía de Despliegue# FrontendApp



> **Proyecto:** Sistema de Gestión de Prácticas Pre-Profesionales  This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.20.

> **Tecnología:** Angular 18 + Docker  

> **Autor:** Equipo Code5  ## Development server



## 📋 ÍndiceRun `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.



1. [Prerrequisitos](#-prerrequisitos)## Code scaffolding

2. [Instalación Rápida](#-instalación-rápida)

3. [Métodos de Despliegue](#-métodos-de-despliegue)Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

4. [Configuración de Desarrollo](#-configuración-de-desarrollo)

5. [Configuración de Producción](#-configuración-de-producción)## Build

6. [Solución de Problemas](#-solución-de-problemas)

7. [Comandos Útiles](#-comandos-útiles)Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.



---## Running unit tests



## 🎯 PrerrequisitosRun `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).



Antes de comenzar, asegúrate de tener instalado:## Running end-to-end tests



### **Opción 1: Con Docker (Recomendado)**Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

- [Docker](https://www.docker.com/get-started) (v20.10+)

- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)## Further help

- Git

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

### **Opción 2: Instalación Local**
- [Node.js](https://nodejs.org/) (v18 o v20)
- [Angular CLI](https://angular.io/cli) (`npm install -g @angular/cli`)
- Git

---

## ⚡ Instalación Rápida

### **Paso 1: Clonar el Repositorio**
```bash
# Clonar el proyecto
git clone https://github.com/arlysanchez/code5_ppp_front.git
cd code5_ppp_front

# Cambiar a la rama de desarrollo (si es necesario)
git checkout CalebDev
```

### **Paso 2: Elegir Método de Despliegue**

#### **🐳 Con Docker (MÁS FÁCIL)**
```bash
# Hacer ejecutable y correr el script automático
chmod +x dockerize.sh
./dockerize.sh
```

#### **💻 Sin Docker (Método Tradicional)**
```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm start
```

---

## 🔄 Métodos de Despliegue

### **Método 1: Docker Automático (Recomendado)**

**Para usar este método:**
```bash
# 1. Hacer el script ejecutable
chmod +x dockerize.sh

# 2. Ejecutar dockerización automática
./dockerize.sh
```

**El script te preguntará:**
- ¿Crear backup? (Recomendado: `y`)
- ¿Limpiar contenedores anteriores? (Recomendado: `y`)

**Resultado:**
- ✅ Aplicación corriendo en: http://localhost
- ✅ Contenedor: `code5_frontend`
- ✅ Configuración optimizada de producción

### **Método 2: Docker para Desarrollo**

**Para desarrollo con hot-reload:**
```bash
# 1. Hacer ejecutable
chmod +x dev.sh

# 2. Iniciar desarrollo
./dev.sh start
```

**Resultado:**
- ✅ Aplicación corriendo en: http://localhost:4200
- ✅ Hot-reload activado
- ✅ Cambios en tiempo real

### **Método 3: Instalación Local**

**Paso a paso:**
```bash
# 1. Instalar dependencias
npm install

# 2. Ejecutar en desarrollo
npm start

# 3. Construir para producción (opcional)
npm run build
```

---

## 🛠️ Configuración de Desarrollo

### **Con Docker**
```bash
# Iniciar desarrollo
./dev.sh start

# Ver logs en tiempo real
./dev.sh logs

# Acceder al contenedor
./dev.sh shell

# Detener desarrollo
./dev.sh stop
```

### **Sin Docker**
```bash
# Modo desarrollo
npm start

# Modo watch (reconstrucción automática)
npm run watch

# Ejecutar pruebas
npm test
```

### **URLs de Desarrollo:**
- **Frontend:** http://localhost:4200
- **Recarga automática:** ✅ Activada

---

## 🚀 Configuración de Producción

### **Con Docker (Recomendado)**
```bash
# Despliegue automático
./dockerize.sh

# Verificar estado
docker ps

# Ver logs
docker-compose logs -f
```

### **Sin Docker**
```bash
# Construir para producción
npm run build

# Los archivos estarán en dist/frontend-app/
# Servir con cualquier servidor web (nginx, apache, etc.)
```

### **URLs de Producción:**
- **Frontend:** http://localhost (puerto 80)
- **Optimización:** ✅ Gzip, cache, minificación

---

## 🚨 Solución de Problemas

### **Error: Puerto ocupado**
```bash
# Cambiar puerto en docker-compose.yml
ports:
  - "8080:80"  # Usar puerto 8080 en lugar de 80
```

### **Error: Docker no encontrado**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose-plugin

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER
# Cerrar sesión y volver a entrar

# Verificar instalación
docker --version
docker compose version
```

### **Error: Permisos denegados**
```bash
# Hacer ejecutables los scripts
chmod +x dockerize.sh
chmod +x dev.sh
```

### **Error: Node.js no encontrado**
```bash
# Instalar Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node --version
npm --version
```

### **Error: Angular CLI no encontrado**
```bash
# Instalar Angular CLI globalmente
npm install -g @angular/cli

# Verificar instalación
ng version
```

### **Limpiar Todo (Último Recurso)**
```bash
# Con Docker
docker system prune -a
docker volume prune

# Sin Docker
rm -rf node_modules
rm package-lock.json
npm install
```

---

## 🎮 Comandos Útiles

### **Docker - Producción**
```bash
# Ver estado de contenedores
docker ps

# Ver logs
docker-compose logs -f

# Reiniciar aplicación
docker-compose restart

# Detener aplicación
docker-compose down

# Acceder al contenedor
docker exec -it code5_frontend sh

# Ver uso de recursos
docker stats
```

### **Docker - Desarrollo**
```bash
# Comandos del script dev.sh
./dev.sh start     # Iniciar
./dev.sh stop      # Detener
./dev.sh restart   # Reiniciar
./dev.sh logs      # Ver logs
./dev.sh shell     # Acceder al contenedor
./dev.sh build     # Reconstruir imagen
```

### **NPM - Local**
```bash
# Comandos disponibles
npm start          # Desarrollo
npm run build      # Producción
npm test           # Pruebas
npm run watch      # Watch mode
npm install        # Instalar dependencias
```

### **Git - Control de Versiones**
```bash
# Ver rama actual
git branch

# Cambiar a rama de desarrollo
git checkout CalebDev

# Actualizar código
git pull origin CalebDev

# Ver estado
git status
```

---

## 🗂️ Estructura del Proyecto

```
code5_ppp_front/
├── 📱 src/                    # Código fuente Angular
│   ├── app/                   # Aplicación principal
│   │   ├── components/        # Componentes reutilizables
│   │   ├── pages/            # Páginas de la aplicación
│   │   │   ├── mis_practicas/    # Módulo estudiantes
│   │   │   └── gestion_practicas/ # Módulo administración
│   │   ├── core/             # Servicios core
│   │   └── shared/           # Componentes compartidos
│   ├── assets/               # Recursos estáticos
│   └── environments/         # Configuraciones por entorno
├── 🐳 Docker Files            # Configuración Docker
│   ├── Dockerfile            # Imagen de producción
│   ├── Dockerfile.dev        # Imagen de desarrollo
│   ├── docker-compose.yml    # Orquestación producción
│   └── docker-compose.dev.yml # Orquestación desarrollo
├── 🚀 Scripts                # Scripts de automatización
│   ├── dockerize.sh          # Dockerización automática
│   └── dev.sh               # Desarrollo con Docker
└── 📚 Documentación
    ├── README.md            # Este archivo
    └── DOCKER-README.md     # Documentación Docker
```

---

## 📊 Información del Sistema

### **Componentes Principales:**
- **Estado CAPSI:** `mis_practicas/estado-capsi` - Dashboard del estudiante
- **Evaluación CAPSI:** `gestion_practicas/evaluacion-capsi` - Panel administrativo
- **Header/Navbar:** Navegación responsive
- **Sidebar:** Menú lateral contextual

### **Tecnologías Utilizadas:**
- **Frontend:** Angular 18 (Standalone Components)
- **Estilos:** CSS3 + Responsive Design
- **Iconos:** Ionicons 7.1.0
- **Contenedores:** Docker + Nginx
- **Servidor:** Nginx Alpine (Producción)

### **Características:**
- ✅ **Responsive Design** - Móvil, tablet, desktop
- ✅ **Componentes Standalone** - Angular 18
- ✅ **Signals** - Estado reactivo moderno
- ✅ **Hot Reload** - Desarrollo ágil
- ✅ **Docker** - Despliegue consistente
- ✅ **PWA Ready** - Lista para Progressive Web App

---

## 📞 Soporte y Contacto

### **Si tienes problemas:**

1. **Revisa esta documentación** completa
2. **Verifica los prerrequisitos** estén instalados
3. **Consulta los logs:**
   ```bash
   # Docker
   docker-compose logs -f
   
   # Local
   npm start (ver consola)
   ```
4. **Reinicia todo:**
   ```bash
   # Docker
   docker-compose restart
   
   # Local
   Ctrl+C y npm start
   ```

### **Para el Equipo:**
- **Repositorio:** https://github.com/arlysanchez/code5_ppp_front
- **Rama Principal:** `main`
- **Rama de Desarrollo:** `CalebDev`
- **Issues:** Usar GitHub Issues para reportar problemas

---

## 🎉 ¡Listo para Usar!

**Método más rápido para el equipo:**

```bash
# 1. Clonar
git clone https://github.com/arlysanchez/code5_ppp_front.git
cd code5_ppp_front

# 2. Dockerizar (automático)
chmod +x dockerize.sh
./dockerize.sh

# 3. Abrir navegador
# http://localhost
```

**¡Tu aplicación Code5 PPP está corriendo! 🚀**

---

*Documentación actualizada: Febrero 2026*  
*Versión: 1.0.0*