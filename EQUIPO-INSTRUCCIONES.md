# 👥 INSTRUCCIONES PARA EL EQUIPO - Code5 PPP

## 🚀 DESPLIEGUE RÁPIDO (3 COMANDOS)

Si tienes **Docker instalado** (recomendado):

```bash
# 1. Clonar el repositorio
git clone https://github.com/arlysanchez/code5_ppp_front.git
cd code5_ppp_front

# 2. Ejecutar script automático
chmod +x dockerize.sh && ./dockerize.sh

# 3. Abrir http://localhost en tu navegador
```

**¡LISTO! Tu aplicación está corriendo.**

---

## 📱 SIN DOCKER (Método alternativo)

Si **NO tienes Docker**:

```bash
# 1. Clonar el repositorio
git clone https://github.com/arlysanchez/code5_ppp_front.git
cd code5_ppp_front

# 2. Instalar Node.js (si no lo tienes)
# Ir a https://nodejs.org y descargar la versión 18 LTS

# 3. Instalar dependencias y ejecutar
npm install
npm start

# 4. Abrir http://localhost:4200 en tu navegador
```

---

## 🔧 INSTALACIÓN DE PRERREQUISITOS

### **Windows:**

#### **Docker (Recomendado):**
1. Descargar [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Ejecutar el instalador
3. Reiniciar Windows
4. Abrir PowerShell o CMD

#### **Node.js (Alternativo):**
1. Ir a https://nodejs.org
2. Descargar "LTS" (versión 18 o 20)
3. Ejecutar el instalador
4. Abrir PowerShell o CMD

### **Mac:**

#### **Docker:**
```bash
# Con Homebrew
brew install --cask docker

# O descargar de https://www.docker.com/products/docker-desktop/
```

#### **Node.js:**
```bash
# Con Homebrew
brew install node@18

# O descargar de https://nodejs.org
```

### **Linux (Ubuntu/Debian):**

#### **Docker:**
```bash
# Instalar Docker
sudo apt update
sudo apt install docker.io docker-compose-plugin

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Cerrar sesión y volver a entrar, luego verificar
docker --version
```

#### **Node.js:**
```bash
# Instalar Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node --version
npm --version
```

---

## 📋 CHECKLIST DE VERIFICACIÓN

Antes de empezar, verifica que tengas:

### **Con Docker:**
- [ ] Docker instalado (`docker --version`)
- [ ] Git instalado (`git --version`)
- [ ] Conexión a internet

### **Sin Docker:**
- [ ] Node.js v18+ instalado (`node --version`)
- [ ] NPM instalado (`npm --version`)
- [ ] Git instalado (`git --version`)
- [ ] Conexión a internet

---

## 🎯 COMANDOS IMPORTANTES

### **Durante el desarrollo:**

```bash
# Ver logs si hay problemas
docker-compose logs -f

# Reiniciar si algo no funciona
docker-compose restart

# Detener la aplicación
docker-compose down
```

### **Para desarrollo con cambios en tiempo real:**

```bash
# Usar modo desarrollo
./dev.sh start

# Ver en http://localhost:4200
# Los cambios se actualizan automáticamente
```

---

## 🆘 SOLUCIÓN A PROBLEMAS COMUNES

### **❌ Error: "Puerto ocupado"**
**Problema:** Ya hay algo corriendo en el puerto 80 o 4200

**Solución:**
```bash
# Matar procesos que usan el puerto
sudo lsof -ti:80 | xargs sudo kill -9
sudo lsof -ti:4200 | xargs sudo kill -9

# O cambiar puerto en docker-compose.yml:
ports:
  - "8080:80"  # Usar puerto 8080
```

### **❌ Error: "Docker command not found"**
**Problema:** Docker no está instalado

**Solución:**
1. Instalar Docker Desktop desde https://www.docker.com/
2. Reiniciar la computadora
3. Verificar: `docker --version`

### **❌ Error: "Budget exceeded" o "build failed"**
**Problema:** Los archivos CSS son demasiado grandes para el build de Angular

**Solución:**
```bash
# Este error ya está solucionado en el proyecto
# Si aparece, simplemente volver a ejecutar:
./dockerize.sh
```

**Nota:** *Ya está configurado para permitir archivos CSS más grandes*

### **❌ Error: "Permission denied"**
**Problema:** Scripts sin permisos de ejecución

**Solución:**
```bash
chmod +x dockerize.sh
chmod +x dev.sh
```

### **❌ Error: "Node not found"**
**Problema:** Node.js no está instalado

**Solución:**
1. Ir a https://nodejs.org
2. Descargar versión 18 LTS
3. Instalar y reiniciar terminal
4. Verificar: `node --version`

### **❌ La aplicación no se ve bien**
**Problema:** Cache del navegador

**Solución:**
- Presionar `Ctrl + F5` (Windows/Linux)
- Presionar `Cmd + Shift + R` (Mac)
- O abrir en modo incógnito

---

## 📱 URLS DE LA APLICACIÓN

### **Producción (Docker):**
- **Principal:** http://localhost
- **Con puerto alternativo:** http://localhost:8080

### **Desarrollo:**
- **Con Docker:** http://localhost:4200 (./dev.sh start)
- **Sin Docker:** http://localhost:4200 (npm start)

---

## 🔄 ACTUALIZAR EL PROYECTO

```bash
# Ir al directorio del proyecto
cd code5_ppp_front

# Descargar últimos cambios
git pull origin CalebDev

# Si usas Docker
docker-compose down
./dockerize.sh

# Si usas NPM
npm install
npm start
```

---

## 📞 CONTACTO DE EMERGENCIA

**Si nada funciona:**

1. **Captura de pantalla** del error
2. **Copia el mensaje** completo del error
3. **Especifica tu sistema operativo** (Windows/Mac/Linux)
4. **Reporta en el grupo** o crea un Issue en GitHub

**Información útil para reportar:**
```bash
# Ejecutar estos comandos y compartir el resultado:
docker --version
node --version
git --version
uname -a  # Solo en Mac/Linux
```

---

## 💡 CONSEJOS PARA EL EQUIPO

### **Para desarrollo:**
- Usa `./dev.sh start` para cambios en tiempo real
- Los cambios se reflejan automáticamente
- No necesitas reiniciar el servidor

### **Para presentaciones/demos:**
- Usa `./dockerize.sh` para versión optimizada
- Se ve exactamente como en producción
- Carga más rápido y consume menos recursos

### **Para trabajo colaborativo:**
- Siempre hacer `git pull` antes de empezar
- Usar la rama `CalebDev` para desarrollo
- Commitear cambios frecuentemente

---

## ✅ CHECKLIST DE ENTREGA FINAL

Antes de entregar o presentar:

- [ ] La aplicación inicia sin errores
- [ ] Funciona en http://localhost
- [ ] Se ve bien en móvil (F12 → modo responsive)
- [ ] Todos los componentes cargan correctamente
- [ ] Los iconos se muestran bien
- [ ] La navegación funciona

---

**¡Con esto tu equipo debería poder desplegar el proyecto sin problemas! 🚀**

*Si algún miembro del equipo tiene dudas específicas, puede revisar el README.md completo para más detalles técnicos.*