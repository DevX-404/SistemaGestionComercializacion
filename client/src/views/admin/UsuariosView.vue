<template>
  <div class="page-container">
    <div class="actions-bar">
      <h3>👤 Control de Usuarios y Accesos</h3>
      <button class="btn-primary" @click="abrirModal()">+ Nuevo Usuario</button>
    </div>

    <div class="card-box">
        <table class="monster-table">
            <thead>
                <tr>
                    <th>Usuario</th>
                    <th>Rol Principal</th>
                    <th>Módulos Habilitados (Permisos)</th>
                    <th class="text-right">Acciones</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="user in usuarios" :key="user._id">
                    <td>
                        <div class="user-info">
                            <div class="avatar-circle">{{ user.username.charAt(0).toUpperCase() }}</div>
                            <div>
                                <div class="fw-bold">{{ user.nombre_completo }}</div>
                                <small class="text-muted">@{{ user.username }}</small>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span :class="['badge', getRolClass(user.rol)]">{{ user.rol }}</span>
                    </td>
                    <td>
                        <div class="permisos-list">
                            <span v-for="perm in user.perfil.permisos" :key="perm" class="permiso-tag">
                                {{ perm }}
                            </span>
                        </div>
                    </td>
                    <td class="text-right">
                        <button class="btn-icon edit" @click="abrirModal(user)">✏️</button>
                        <button class="btn-icon delete" @click="eliminar(user._id)">🗑️</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <div v-if="mostrarModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
            <h4>{{ modoEdicion ? 'Editar Usuario' : 'Nuevo Usuario' }}</h4>
            <button @click="cerrarModal" class="btn-close">×</button>
        </div>
        
        <div class="modal-body">
            <div class="row">
                <div class="form-group half">
                    <label>Nombre Completo</label>
                    <input v-model="form.nombre_completo" type="text">
                </div>
                <div class="form-group half">
                    <label>Email</label>
                    <input v-model="form.email" type="email">
                </div>
            </div>
            
            <div class="row">
                <div class="form-group half">
                    <label>Usuario (Login)</label>
                    <input v-model="form.username" type="text" :disabled="modoEdicion">
                </div>
                <div class="form-group half">
                    <label>Contraseña {{ modoEdicion ? '(Opcional)' : '' }}</label>
                    <input v-model="form.password" type="password" placeholder="******">
                </div>
            </div>

            <hr class="separator">

            <div class="form-group">
                 <label>Rol Principal</label>
                 <select v-model="form.rol" @change="aplicarPermisosPorRol">
                   <option value="ADMIN">Administrador (Acceso Total)</option>
                   <option value="VENDEDOR">Vendedor (Caja y Clientes)</option>
                   <option value="ALMACEN">Almacén (Inventario y Proveedores)</option>
                 </select>
            </div>

            <label class="permisos-label">Módulos Permitidos (Personalizable):</label>
            <div class="permisos-grid">
                <label v-for="mod in modulosDisponibles" :key="mod.key" class="checkbox-item">
                    <input type="checkbox" :value="mod.key" v-model="form.permisos">
                    <span>{{ mod.label }}</span>
                </label>
            </div>
        </div>

        <div class="modal-footer">
           <button @click="cerrarModal" class="btn-cancel">Cancelar</button>
           <button @click="guardarUsuario" class="btn-save">Guardar Cambios</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api/axios';

const usuarios = ref([]);
const mostrarModal = ref(false);
const modoEdicion = ref(false);
const idEdicion = ref(null);

// Lista maestra de módulos que tienes en tu sistema
const modulosDisponibles = [
    { key: 'dashboard', label: '📊 Dashboard' },
    { key: 'ventas', label: '🛒 Ventas / Caja' },
    { key: 'clientes', label: '🤝 Clientes' },
    { key: 'inventario', label: '📦 Inventario / Productos' },
    { key: 'proveedores', label: '🚚 Proveedores' },
    { key: 'reportes', label: '📈 Reportes' },
    { key: 'usuarios', label: '👤 Seguridad (Usuarios)' }
];

const form = ref({ 
    username: '', password: '', nombre_completo: '', email: '', 
    rol: 'VENDEDOR', permisos: [] 
});

const cargarUsuarios = async () => {
    try {
        const { data } = await api.get('/usuarios');
        usuarios.value = data;
    } catch (error) { console.error(error); }
};

// Pre-selecciona permisos según el rol elegido
const aplicarPermisosPorRol = () => {
    if (form.value.rol === 'ADMIN') {
        // Seleccionar todos
        form.value.permisos = modulosDisponibles.map(m => m.key);
    } else if (form.value.rol === 'VENDEDOR') {
        form.value.permisos = ['dashboard', 'ventas', 'clientes'];
    } else if (form.value.rol === 'ALMACEN') {
        form.value.permisos = ['dashboard', 'inventario', 'proveedores'];
    }
};

const abrirModal = (user = null) => {
    mostrarModal.value = true;
    if (user) {
        // Modo Editar
        modoEdicion.value = true;
        idEdicion.value = user._id;
        form.value = {
            username: user.username,
            nombre_completo: user.nombre_completo,
            email: user.email,
            rol: user.rol,
            permisos: user.perfil.permisos || [], // Cargamos sus permisos actuales
            password: '' // Vacío por seguridad
        };
    } else {
        // Modo Crear
        modoEdicion.value = false;
        form.value = { username: '', password: '', nombre_completo: '', email: '', rol: 'VENDEDOR', permisos: [] };
        aplicarPermisosPorRol(); // Default
    }
};

const guardarUsuario = async () => {
    try {
        if (modoEdicion.value) {
            await api.put(`/usuarios/${idEdicion.value}`, form.value);
            alert('Usuario actualizado con éxito');
        } else {
            await api.post('/usuarios', form.value);
            alert('Usuario creado con éxito');
        }
        cerrarModal();
        cargarUsuarios();
    } catch (error) {
        alert('Error: ' + (error.response?.data?.message || error.message));
    }
};

const eliminar = async (id) => {
    if(confirm('¿Estás seguro de eliminar este usuario?')) {
        await api.delete(`/usuarios/${id}`);
        cargarUsuarios();
    }
};

const cerrarModal = () => mostrarModal.value = false;
const getRolClass = (rol) => {
    if(rol === 'ADMIN') return 'badge-admin';
    if(rol === 'VENDEDOR') return 'badge-sales';
    return 'badge-stock';
};

onMounted(() => cargarUsuarios());
</script>

<style scoped>
.page-container { padding: 20px; }
.actions-bar { display: flex; justify-content: space-between; margin-bottom: 20px; }
.btn-primary { background: var(--client-primary); color: white; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; }

.card-box { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
.monster-table { width: 100%; border-collapse: collapse; }
.monster-table th { text-align: left; padding: 15px; color: #a2a5b9; border-bottom: 1px solid #eee; }
.monster-table td { padding: 15px; border-bottom: 1px solid #f5f7fb; vertical-align: middle; }

.user-info { display: flex; align-items: center; gap: 10px; }
.avatar-circle { width: 35px; height: 35px; background: #e1f0ff; color: #3699ff; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: bold; }
.text-muted { color: #b5b5c3; font-size: 0.8rem; }

/* Badges */
.badge { padding: 5px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: bold; }
.badge-admin { background: #ffe2e5; color: #f64e60; }
.badge-sales { background: #c9f7f5; color: #1bc5bd; }
.badge-stock { background: #fff4de; color: #ffa800; }

.permisos-list { display: flex; gap: 5px; flex-wrap: wrap; }
.permiso-tag { background: #f3f6f9; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; color: #7e8299; border: 1px solid #eee; }

/* Modal */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 999; }
.modal-content { background: white; padding: 25px; border-radius: 12px; width: 600px; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
.btn-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; }

.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; font-weight: 500; font-size: 0.9rem; }
.form-group input, .form-group select { width: 100%; padding: 10px; border: 1px solid #e4e6ef; border-radius: 6px; }

.permisos-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #eee; }
.checkbox-item { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.9rem; }

.modal-footer { margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px; }
.btn-save { background: #1bc5bd; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
.btn-cancel { background: #f3f6f9; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
.separator { border: 0; border-top: 1px solid #eee; margin: 20px 0; }
</style>