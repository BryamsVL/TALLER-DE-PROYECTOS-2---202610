# 🚀 Guía de Instalación y Ejecución Paso a Paso

Este proyecto está compuesto por tres arquitecturas o servicios principales que trabajan en conjunto: un **Motor CSP (Python)** para la optimización y lógica de Inteligencia Artificial, un **API Gateway (Express)** que maneja el backend tradicional y la conexión con Supabase, y una **Aplicación Web (Next.js)** para la interfaz de usuario.

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente en tu sistema:

- **Node.js** (Versión LTS recomendada)
- **Python** (Versión 3.10 o superior)
- **Git**

---

## ⚙️ Paso 1: Clonar el Repositorio

Abre tu terminal y clona el proyecto desde el repositorio oficial:

```bash
git clone https://github.com/BryamsVL/TALLER-DE-PROYECTOS-2---202610
```

> **Nota:** Asegúrate de que la ruta raíz de tu terminal sea siempre la carpeta del proyecto `TALLER-DE-PROYECTOS-2---202610` antes de proceder con los siguientes pasos.

---

## 🛠️ Paso 2: Instalación de Dependencias

Para que el proyecto funcione correctamente, debes instalar las dependencias de cada servicio. Sigue el orden a continuación:

### 1. Backend - Motor CSP (Python)

Navega al directorio del servicio CSP, crea un entorno virtual e instala los requerimientos:

```bash
cd backend/csp-service
python -m venv venv
```

Para activar el entorno virtual (dependiendo de tu sistema operativo):

**Windows (PowerShell):**

```bash
.\venv\Scripts\Activate.ps1
```

**Windows (CMD):**

```bash
.\venv\Scripts\activate.bat
```

**Linux/macOS:**

```bash
source venv/bin/activate
```

Instala las dependencias necesarias (como Google OR-Tools, FastAPI, uvicorn, etc.):

```bash
pip install -r requirements.txt
```

Regresa a la raíz:

```bash
cd ../..
```

### 2. Backend - API Gateway (Express)

Navega a la carpeta del backend principal e instala los paquetes de Node.js:

```bash
cd Backend
npm install
cd ..
```

### 3. Frontend - Aplicación Web (Next.js)

Navega a la carpeta de la interfaz web e instala las dependencias de React/Next.js:

```bash
cd frontend
npm install
cd ..
```

---

## 🏁 Paso 3: Instrucciones de Inicio

Para levantar todo el ecosistema del proyecto, abre **tres terminales o pestañas diferentes** apuntando a la raíz del proyecto (`TALLER-DE-PROYECTOS-2---202610`) y ejecuta un comando en cada una:

### 💻 Terminal 1: Motor CSP (Python)

Este es el cerebro inteligente basado en Inteligencia Artificial y Google OR-Tools.

```bash
cd backend/csp-service
.\venv\Scripts\Activate.ps1   # O el comando según tu SO
uvicorn app.main:app --reload --port 8002
```

### 🔌 Terminal 2: API Gateway (Express Backend)

Este servicio conecta la base de datos de Supabase con el motor CSP y el frontend.

```bash
cd Backend
npm run dev
```

El servidor de desarrollo iniciará automáticamente en el puerto **3001**.

### 🎨 Terminal 3: Aplicación Web (Next.js Frontend)

La interfaz gráfica de usuario donde se realizan todas las acciones interactivas.

```bash
cd frontend
npm run dev
```

El servidor de desarrollo de Next.js se ejecutará en el puerto **3000**.

---

## 🌐 Resumen de Puertos y Servicios

Una vez que todas las terminales estén activas, tendrás acceso a los siguientes servicios locales:


| Servicio    | Tecnología       | Puerto por Defecto | URL Local                                      |
| ----------- | ---------------- | ------------------ | ---------------------------------------------- |
| Frontend UI | Next.js          | 3000               | [http://localhost:3000](http://localhost:3000) |
| API Gateway | Express.js       | 3001               | [http://localhost:3001](http://localhost:3001) |
| Motor CSP   | Python / FastAPI | 8002               | [http://localhost:8002](http://localhost:8002) |


---

