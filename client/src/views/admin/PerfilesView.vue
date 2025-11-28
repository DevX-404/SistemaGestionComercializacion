<template>
  <div class="page-container">
    <h3>🔑 Perfiles y Permisos</h3>
    <p class="subtitle">Gestión de accesos basada en roles (MongoDB)</p>

    <div class="profiles-container">
      <div class="profile-card admin">
        <div class="header">
          <h2>ADMIN</h2>
          <span class="count">{{ contarUsuarios('ADMIN') }} Usuarios</span>
        </div>
        <ul class="permissions-list">
          <li class="checked">Acceso Total al Sistema</li>
          <li class="checked">Gestión de Usuarios</li>
          <li class="checked">Anular Ventas</li>
          <li class="checked">Ver Reportes Financieros</li>
          <li class="checked">Configuración Global</li>
        </ul>
      </div>

      <div class="profile-card vendedor">
        <div class="header">
          <h2>VENDEDOR</h2>
          <span class="count">{{ contarUsuarios('VENDEDOR') }} Usuarios</span>
        </div>
        <ul class="permissions-list">
          <li class="checked">Punto de Venta (POS)</li>
          <li class="checked">Registro de Clientes</li>
          <li class="checked">Consultar Inventario</li>
          <li class="unchecked">Anular Ventas</li>
          <li class="unchecked">Ver Reportes Financieros</li>
        </ul>
      </div>

      <div class="profile-card almacen">
        <div class="header">
          <h2>ALMACÉN</h2>
          <span class="count">{{ contarUsuarios('ALMACEN') }} Usuarios</span>
        </div>
        <ul class="permissions-list">
          <li class="checked">Consultar Inventario</li>
          <li class="checked">Registrar Ingresos</li>
          <li class="checked">Gestionar Proveedores</li>
          <li class="unchecked">Acceso a Caja</li>
          <li class="unchecked">Gestión de Usuarios</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api/axios';

const usuarios = ref([]);

// Traemos los usuarios para contar cuántos hay de cada rol
onMounted(async () => {
    const { data } = await api.get('/usuarios');
    usuarios.value = data;
});

const contarUsuarios = (rol) => {
    return usuarios.value.filter(u => u.rol === rol).length;
};
</script>

<style scoped>
.page-container { padding: 20px; }
.subtitle { color: #b5b5c3; margin-bottom: 30px; }

.profiles-container { display: flex; gap: 30px; flex-wrap: wrap; }
.profile-card { flex: 1; min-width: 300px; background: white; border-radius: 12px; padding: 0; box-shadow: 0 4px 20px rgba(0,0,0,0.05); overflow: hidden; }

.header { padding: 30px; color: white; text-align: center; }
.header h2 { margin: 0; font-size: 1.5rem; letter-spacing: 2px; }
.count { background: rgba(0,0,0,0.2); padding: 5px 15px; border-radius: 20px; font-size: 0.8rem; margin-top: 10px; display: inline-block; }

/* Colores por Rol */
.admin .header { background: linear-gradient(135deg, #f64e60 0%, #ff7f90 100%); }
.vendedor .header { background: linear-gradient(135deg, #1bc5bd 0%, #46e3db 100%); }
.almacen .header { background: linear-gradient(135deg, #ffa800 0%, #ffc65c 100%); }

.permissions-list { list-style: none; padding: 20px; margin: 0; }
.permissions-list li { padding: 12px 0; border-bottom: 1px dashed #ebedf3; font-size: 0.9rem; display: flex; align-items: center; }
.permissions-list li:last-child { border-bottom: none; }

.checked::before { content: '✅'; margin-right: 10px; }
.unchecked { color: #b5b5c3; text-decoration: line-through; }
.unchecked::before { content: '❌'; margin-right: 10px; opacity: 0.5; }
</style>