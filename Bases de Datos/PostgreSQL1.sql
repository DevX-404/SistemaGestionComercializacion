-- ============================================================
-- 1. TABLA PROVEEDORES
-- ============================================================
CREATE TABLE proveedores (
    id SERIAL PRIMARY KEY,
    ruc VARCHAR(11) NOT NULL UNIQUE,
    razon_social VARCHAR(150) NOT NULL,
    contacto_nombre VARCHAR(100),
    telefono VARCHAR(20),
    direccion TEXT,
    estado VARCHAR(20) DEFAULT 'ACTIVO'
);

-- ============================================================
-- 2. TABLA ALMACENES
-- ============================================================
CREATE TABLE almacenes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    ubicacion VARCHAR(100)
);

-- ============================================================
-- 3. TABLA INVENTARIO RESUMEN (Stock Actual)
-- ============================================================
CREATE TABLE inventario_resumen (
    producto_sku VARCHAR(50) NOT NULL,
    almacen_id INT REFERENCES almacenes(id),
    stock_actual INT DEFAULT 0,
    stock_minimo INT DEFAULT 5,
    costo_promedio DECIMAL(10,2),
    PRIMARY KEY (producto_sku, almacen_id)
);

-- ============================================================
-- 4. TABLA KARDEX DE MOVIMIENTOS
-- ============================================================
CREATE TABLE kardex_movimientos (
    id SERIAL PRIMARY KEY,
    producto_sku VARCHAR(50) NOT NULL,
    almacen_id INT REFERENCES almacenes(id),
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipo_movimiento VARCHAR(30) NOT NULL,
    cantidad INT NOT NULL,
    costo_unitario DECIMAL(10,2),
    saldo_stock_resultante INT NOT NULL,
    referencia_documento VARCHAR(50)
);

-- ============================================================
-- INSERTS
-- ============================================================

-- 1. Asegurar que exista el almacén principal
INSERT INTO almacenes (id, nombre, ubicacion)
VALUES (1, 'Almacén Central - Chiclayo', 'Av. Industrial 123')
ON CONFLICT (id) DO NOTHING;

-- Asegurar que costo_promedio sea DECIMAL(10,2)
ALTER TABLE inventario_resumen
    ALTER COLUMN costo_promedio TYPE DECIMAL(10,2);

-- Ejecutar en db_logistica (PgAdmin)
ALTER TABLE inventario_resumen ADD COLUMN IF NOT EXISTS stock_minimo INT DEFAULT 5;