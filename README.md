# 🚀 Sistema Integral de Gestión Comercial (ERP Híbrido)

¡Hola! 👋 Bienvenido al repositorio de mi **Sistema de Gestión Comercial**. Este es un proyecto completo desarrollado con tecnologías modernas, diseñado para administrar el ciclo de vida de un negocio retail o mayorista.

Lo más interesante de este sistema es su arquitectura de **Persistencia Políglota**: combino la flexibilidad de **MongoDB** para el catálogo de productos con la integridad transaccional de **MySQL** para las ventas y finanzas.

## 🌟 Características Principales

### 1. 🛒 Punto de Venta (POS) Moderno
- Interfaz ágil para registrar ventas rápidas.
- Búsqueda reactiva de productos (sin recargas).
- Carrito de compras inteligente gestionado con **Pinia**.
- Emisión de tickets y cálculo automático de impuestos.

### 2. 📦 Gestión de Inventario Avanzada (Kardex)
- **Catálogo en MongoDB:** Permite atributos flexibles en los productos.
- **Control de Stock:** Movimientos de entrada y salida reflejados en tiempo real.
- **Kardex:** Historial detallado de movimientos para auditoría.

### 3. 📊 Dashboard Gerencial e Inteligencia de Negocios
- Tarjetas KPI con métricas en vivo: Ingresos, Clientes Activos, Stock.
- Gráficos interactivos de rendimiento mensual.
- **Reportes Profesionales:** Exportación a Excel con estilos corporativos (usando `xlsx-js-style`).

### 4. 🌐 Módulo Público (E-commerce)
- Catálogo web para que los clientes vean productos disponibles.
- Carrito de compras flotante.
- Pasarela para pagos de créditos y visualización de deuda.

### 5. 🔐 Seguridad y Administración
- **Autenticación JWT:** Acceso seguro y persistencia de sesión.
- **Control de Accesos (RBAC):** Diferenciación entre Administradores y Vendedores.
- Gestión de Usuarios, Proveedores y Clientes.

---

## 🛠️ Tecnologías Usadas

Este sistema utiliza un stack moderno y robusto:

- **Frontend:** Vue.js 3 + Vite (Súper rápido ⚡).
- **Estado Global:** Pinia.
- **Estilos:** CSS Moderno con variables + Componentes reactivos.
- **Backend:** Node.js + Express.
- **Arquitectura de Datos Híbrida:**
  - 🍃 **MongoDB (Mongoose):** Para Productos, Categorías y Usuarios (Datos NoSQL).
  - 🐬 **MySQL (Sequelize/MySQL2):** Para Ventas, Detalle de Venta y Transacciones (Datos Relacionales ACID).
- **Herramientas:** Axios, Multer (Carga de imágenes), Bcrypt.

---

## ⚙️ Guía de Instalación Paso a Paso

Sigue estos pasos para ejecutar el proyecto en tu máquina local.

### 1. Preparar las Bases de Datos 🗄️
Necesitarás tener instalados **MySQL** y **MongoDB**.

1. **MySQL:** Crea una base de datos llamada `sistema_comercial_db` y ejecuta el script SQL adjunto en la carpeta `/docs` (si lo hubiera) o deja que el backend sincronice las tablas.
2. **MongoDB:** Asegúrate de tener el servicio corriendo localmente o ten lista tu URL de conexión a MongoDB Atlas.

### 2. Configurar el Backend (Servidor) 🔙
1. Abre una terminal y entra a la carpeta del servidor:

   ```bash
   cd server
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Crea un archivo .env en la raíz de server/ con tus credenciales

4. Inicia el servidor:

   ```bash
   npm run dev
   ```

### 3. Configurar el Frontend (Cliente Vue) 🎨
1. Abre una nueva terminal y entra a la carpeta del cliente:

   ```bash
   cd client
   ```
2. Instala las dependencias (incluyendo la librería de Excel nueva):

   ```bash
   npm install
   ```

3. Levanta el entorno de desarrollo:

   ```bash
   npm run dev
   ```

4. Abre el link que aparece (usualmente http://localhost:5173/).

🚦 Guía de Uso Rápido
1. 🅰️ Acceso al Sistema
- Ve al Login.
- Ingresa con el usuario administrador por defecto (creado en el script de seed o base de datos).
- Tip: Revisa server/crearAdmin.js si necesitas crear un usuario inicial.

2. 🅱️ Flujo de Venta
- Ve a Inventario y asegúrate de tener productos cargados.
- Ve a Nueva Venta (POS).
- Busca productos por nombre o SKU y agrégalos al carrito.
- Selecciona el cliente y el método de pago.
- ¡Procesar Venta! Se descontará el stock en MongoDB y se guardará la transacción en MySQL.

3. ©️ Generación de Reportes
- Ve a la sección Reportes.
- Selecciona un rango de fechas.
- Haz clic en "Descargar Excel Corporativo" para ver el reporte estilizado generado automágicamente.

📂 Estructura del Proyecto
Bash

SistemaGestionComercializacion/
├── client/              # Frontend Vue.js
│   ├── src/
│   │   ├── api/         # Configuración de Axios
│   │   ├── components/  # Gráficos, Tablas, Cards
│   │   ├── stores/      # Estado global (Pinia)
│   │   └── views/       # Vistas (Admin, Ventas, Public)
│
└── server/              # Backend Node.js
    ├── src/
    │   ├── config/      # Conexión a DBs
    │   ├── controllers/ # Lógica del sistema
    │   ├── models/      
    │   │   ├── sql/     # Modelos MySQL (Ventas)
    │   │   └── nosql/   # Esquemas Mongoose (Productos)
    │   └── routes/      # Endpoints de la API


Desarrollado con 💻, ☕ y mucha pasión por la programación.

Ing. Ximena Burga y Ing. Luis Bances 