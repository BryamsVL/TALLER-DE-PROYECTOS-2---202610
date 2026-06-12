Ran command: `git add .`
Ran command: `git commit -m "Primera versión funcional del generador de horarios con 161 cursos"`
Viewed Readme.md:17-30
Listed directory TALLER-DE-PROYECTOS-2---202610
Viewed package.json:1-75
Viewed package.json:1-41
Searched for "solver"
Listed directory Backend
Listed directory csp-service
Viewed README.md:1-100
Searched for "800"

Para reiniciar todos los servidores de la plataforma de forma limpia y ordenada si apagas la computadora o cierras las terminales, debes iniciar **3 servicios en paralelo** (uno en cada pestaña o ventana de tu terminal/PowerShell). 

Aquí tienes la guía paso a paso, explicada de forma clara y estructurada de manera premium:

---

### 🌐 Resumen del Arquitectura Local
* **Frontend (Next.js)**: Puerto `3000` (ubicado en `/web`).
* **Backend (Express)**: Puerto `3001` (ubicado en `/Backend`).
* **Motor CSP (Python FastAPI)**: Puerto `8002` (ubicado en `/Backend/csp-service`).
* **Base de Datos**: Está alojada en la nube de **Supabase**, por lo que **no** necesitas iniciar ningún motor local de PostgreSQL. ¡Siempre está en línea!

---

### 🚀 Instrucciones de Inicio Paso a Paso

Abre **tres terminales o pestañas diferentes** (asegúrate de que la ruta raíz de tu terminal sea la carpeta del proyecto `TALLER-DE-PROYECTOS-2---202610`) y ejecuta lo siguiente:

#### 💻 Terminal 1: Motor CSP (Python)
Este es el cerebro inteligente basado en Inteligencia Artificial y Google OR-Tools.

cd backend\csp-service
  .\venv\Scripts\Activate.ps1
  uvicorn app.main:app --reload --port 8002
---

#### 🔌 Terminal 2: API Gateway (Express Backend)
Este servicio conecta la base de datos de Supabase con el motor CSP y el frontend.
1. Navega a la carpeta del backend:
   ```bash
   cd Backend
   ```
2. Inicia el servidor de desarrollo en el puerto `3001`:
   ```bash
   npm run dev
   ```

---

#### 🎨 Terminal 3: Aplicación Web (Next.js Frontend)
La interfaz gráfica de usuario donde realizas todas las acciones.
1. Navega a la carpeta de la interfaz web:
   ```bash
   cd frontend    
   ```
2. Inicia el servidor de desarrollo de Next.js en el puerto `3000`:
   ```bash
   npm run dev
   ```

---

### 💡 Tips Pro de Diagnóstico (Por si algo falla)

1. **"¿Cómo sé si todo está listo?"**
   Puedes abrir tu navegador preferido e ingresar a:
   * **Frontend**: `http://localhost:3000`
   * **Backend Express**: `http://localhost:3001`
   * **Docs del Motor CSP (Swagger UI)**: `http://localhost:8002/docs`

2. **Error `EPERM` o puerto bloqueado en Windows**:
   Si al iniciar `web` te dice que el puerto `3000` está ocupado o recibes un error de acceso con Prisma, abre una terminal de **PowerShell como Administrador** y limpia el puerto ejecutando:
   ```powershell
   Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
   ```
   *(Cambia `3000` por el puerto bloqueado `3001` o `8002` si fuera necesario)*.

¡Y listo! Con esto tendrás tu entorno completo de SGOHA operativo al 100% en segundos. ¡Mucho éxito en tus pruebas! 🌟📖