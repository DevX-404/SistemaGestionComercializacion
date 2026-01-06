-- ============================================================
--  CREAR BASE DE DATOS
-- ============================================================
CREATE DATABASE IF NOT EXISTS db_ventas;
USE db_ventas;

-- ============================================================
-- 1. TABLA CLIENTES
-- ============================================================
CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_documento ENUM('DNI', 'RUC') NOT NULL,
    numero_documento VARCHAR(20) NOT NULL UNIQUE,
    razon_social VARCHAR(150) NOT NULL,
    direccion VARCHAR(200),
    telefono VARCHAR(20),
    email VARCHAR(100),
    linea_credito DECIMAL(10,2) DEFAULT 0.00,
    estado ENUM('ACTIVO', 'INACTIVO') DEFAULT 'ACTIVO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. TABLA VENTAS CABECERA
-- ============================================================
CREATE TABLE ventas_cabecera (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    usuario_id VARCHAR(50) NOT NULL,
    fecha_emision DATETIME DEFAULT CURRENT_TIMESTAMP,
    tipo_pago ENUM('CONTADO', 'CREDITO') NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    igv DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    estado ENUM('COMPLETADO', 'ANULADO') DEFAULT 'COMPLETADO',
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

-- ============================================================
-- 3. TABLA VENTAS DETALLE
-- ============================================================
CREATE TABLE ventas_detalle (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venta_id INT NOT NULL,
    producto_sku VARCHAR(50) NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (venta_id) REFERENCES ventas_cabecera(id)
);

-- ============================================================
-- 4. TABLA CUENTAS POR COBRAR
-- ============================================================
CREATE TABLE cuentas_por_cobrar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venta_id INT NOT NULL,
    monto_total DECIMAL(10,2) NOT NULL,
    monto_pagado DECIMAL(10,2) DEFAULT 0.00,
    saldo_pendiente DECIMAL(10,2) NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    cuotas_totales INT DEFAULT 1,
    estado ENUM('PENDIENTE', 'PAGADO', 'VENCIDO') DEFAULT 'PENDIENTE',
    FOREIGN KEY (venta_id) REFERENCES ventas_cabecera(id)
);

-- ============================================================
-- 5. TABLA PAGOS DE CRÉDITO
-- ============================================================
CREATE TABLE pagos_credito (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cuenta_id INT NOT NULL,
    monto_pagado DECIMAL(10,2) NOT NULL,
    fecha_pago DATETIME DEFAULT CURRENT_TIMESTAMP,
    metodo_pago VARCHAR(50),
    FOREIGN KEY (cuenta_id) REFERENCES cuentas_por_cobrar(id)
);

-- ============================================================
-- 6. TABLA CRONOGRAMA DE PAGOS
-- ============================================================
CREATE TABLE cronograma_pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cuenta_id INT NOT NULL,
    numero_cuota INT NOT NULL,
    monto_cuota DECIMAL(10,2) NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    estado ENUM('PENDIENTE', 'PAGADO') DEFAULT 'PENDIENTE',
    fecha_pago DATETIME NULL,
    FOREIGN KEY (cuenta_id) REFERENCES cuentas_por_cobrar(id)
);

