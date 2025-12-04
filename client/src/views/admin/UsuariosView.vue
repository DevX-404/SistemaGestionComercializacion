<template>
  <div class="page-container fade-in">
    
    <div class="page-header-actions">
      <div class="title-wrapper">
        <h3 class="page-title">Gestión de Usuarios y Accesos</h3>
        <p class="page-subtitle">Administra quién entra y qué puede ver</p>
      </div>
      <button class="btn-primary btn-pulse" @click="abrirModal(null)">
         <span>+</span> Nuevo Usuario
      </button>
    </div>

    <div class="card-box table-responsive">
      <table class="monster-table">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Rol</th>
            <th>Accesos Habilitados</th>
            <th>Estado</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in usuarios" :key="u._id" :class="{'row-inactive': u.estado === 'INACTIVO'}">
            <td>
               <div class="cell-wrapper">
                  <div class="avatar-circle bg-purple">{{ u.username.charAt(0).toUpperCase() }}</div>
                  <div class="cell-text">
                     <span class="main-text fw-bold">@{{ u.username }}</span>
                     <span class="sub-text">{{ u.nombre_completo }}</span>
                  </div>
               </div>
            </td>
            <td><span class="badge-light">{{ u.rol }}</span></td>
            <td>
               <div class="access-tags">
                  <span v-if="u.accesos?.length === 0" class="text-muted small">Sin accesos</span>
                  <span v-else-if="u.accesos?.length === listaModulos.length" class="tag-access full">FULL ACCESO</span>
                  <span v-else v-for="acc in u.accesos.slice(0, 3)" :key="acc" class="tag-access">
                     {{ formatAccess(acc) }}
                  </span>
                  <span v-if="u.accesos?.length > 3" class="tag-more">+{{ u.accesos.length - 3 }}</span>
               </div>
            </td>
            <td>
               <span class="status-badge" :class="u.estado === 'INACTIVO' ? 'inactive' : 'active'">
                  {{ u.estado }}
               </span>
            </td>
            <td class="text-right">
               <button v-if="u.estado !== 'INACTIVO'" class="btn-action edit" @click="abrirModal(u)" title="Editar Permisos">✏️</button>
               <button v-if="u.estado !== 'INACTIVO'" class="btn-action delete" @click="eliminar(u)" title="Revocar Acceso">🗑️</button>
               <button v-else class="btn-action restore" @click="reactivar(u)" title="Reactivar">♻️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <transition name="modal-fade">
       <div v-if="modal" class="modal-backdrop" @click.self="modal = false">
          <div class="modal-card slide-in-up modal-lg"> <div class="modal-header">
                <h4>{{ form._id ? 'Editar Acceso' : 'Crear Usuario' }}</h4>
                <button class="close-btn" @click="modal = false">×</button>
             </div>
             
             <div class="modal-body">
                <div class="split-layout">
                   
                   <div class="left-col">
                      <h5 class="section-title">Credenciales</h5>
                      <div class="form-group">
                         <label>Username</label>
                         <input v-model="form.username" class="input-styled" :disabled="!!form._id">
                      </div>
                      <div class="form-group">
                         <label>Nombre Completo</label>
                         <input v-model="form.nombre_completo" class="input-styled">
                      </div>
                      <div class="form-group">
                         <label>Rol Principal</label>
                         <select v-model="form.rol" class="input-styled" @change="prellenarPermisos">
                            <option value="VENDEDOR">Vendedor</option>
                            <option value="ALMACENERO">Almacenero</option>
                            <option value="ADMIN">Administrador</option>
                         </select>
                      </div>
                      <div class="form-group">
                         <label>{{ form._id ? 'Nueva Contraseña (Opcional)' : 'Contraseña' }}</label>
                         <input v-model="form.password" type="password" class="input-styled" placeholder="••••••">
                      </div>
                   </div>

                   <div class="right-col">
                      <h5 class="section-title">Permisos de Módulos</h5>
                      <p class="text-muted small">Seleccione qué puede ver este usuario en el sistema.</p>
                      
                      <div class="permissions-grid">
                         <label 
                            v-for="mod in listaModulos" 
                            :key="mod.key" 
                            class="permission-card" 
                            :class="{ active: form.accesos.includes(mod.key) }"
                         >
                            <input type="checkbox" :value="mod.key" v-model="form.accesos" hidden>
                            <div class="switch-visual">
                               <div class="knob"></div>
                            </div>
                            <span class="perm-name">{{ mod.label }}</span>
                         </label>
                      </div>
                      
                      <div class="quick-actions">
                         <small @click="seleccionarTodos(true)">Marcar Todos</small>
                         <small @click="seleccionarTodos(false)">Desmarcar Todos</small>
                      </div>
                   </div>

                </div>
             </div>

             <div class="modal-footer">
                <button class="btn-ghost" @click="modal = false">Cancelar</button>
                <button class="btn-primary" @click="guardar">Confirmar Cambios</button>
             </div>
          </div>
       </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api/axios';

const usuarios = ref([]);
const modal = ref(false);

// LISTA DE MÓDULOS DEL SISTEMA (Estos son los 'keys' que usaremos en el router)
const listaModulos = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'ventas', label: 'Ventas & POS' },
    { key: 'creditos', label: 'Créditos' },
    { key: 'clientes', label: 'Clientes' },
    { key: 'productos', label: 'Catálogo' },
    { key: 'proveedores', label: 'Logística' },
    { key: 'kardex', label: 'Kardex' },
    { key: 'reportes', label: 'Reportes' },
    { key: 'usuarios', label: 'Usuarios (Admin)' }
];

const form = ref({ 
    _id: null, username: '', password: '', nombre_completo: '', 
    rol: 'VENDEDOR', accesos: [] // Array de strings
});

const cargar = async () => {
    try {
       const { data } = await api.get('/usuarios');
       usuarios.value = data;
    } catch (e) { console.error(e); }
};

const abrirModal = (u) => {
    if(u) {
        // Clonamos y aseguramos que accesos sea un array
        form.value = { ...u, password: '', accesos: u.accesos || [] };
    } else {
        form.value = { _id: null, username: '', password: '', nombre_completo: '', rol: 'VENDEDOR', accesos: ['ventas'] };
    }
    modal.value = true;
};

const prellenarPermisos = () => {
    // Atajo: Si selecciona ADMIN, le damos todo automáticamente
    if(form.value.rol === 'ADMIN') {
        form.value.accesos = listaModulos.map(m => m.key);
    }
};

const seleccionarTodos = (estado) => {
    form.value.accesos = estado ? listaModulos.map(m => m.key) : [];
};

const guardar = async () => {
    if(!form.value.username) return alert("Falta usuario");
    try {
        if(form.value._id) {
            await api.put(`/usuarios/${form.value._id}`, form.value);
            alert('Usuario actualizado');
        } else {
            if(!form.value.password) return alert("Contraseña obligatoria al crear");
            await api.post('/usuarios', form.value);
            alert('Usuario creado');
        }
        modal.value = false;
        cargar();
    } catch(e) { alert('Error: ' + e.response?.data?.message || e.message); }
};

const eliminar = async (u) => {
    if(confirm('¿Inactivar usuario?')) { await api.delete(`/usuarios/${u._id}`); cargar(); }
};

const reactivar = async (u) => {
    if(confirm('¿Reactivar usuario?')) { await api.patch(`/usuarios/${u._id}/reactivar`); cargar(); }
};

// Helper visual
const formatAccess = (key) => listaModulos.find(m => m.key === key)?.label || key;

onMounted(() => cargar());
</script>

<style scoped>
/* ESTILOS BASE (Ya los tienes, solo agrego los nuevos del modal split) */
.page-container { padding: 20px; font-family: 'Segoe UI', sans-serif; }
.page-header-actions { display: flex; justify-content: space-between; margin-bottom: 25px; }
.btn-primary { background: #5e72e4; color: white; border: none; padding: 10px 20px; border-radius: 5px; font-weight: bold; cursor: pointer; }
.card-box { background: white; border-radius: 15px; padding: 20px; box-shadow: 0 0 2rem rgba(136,152,170,0.15); }
.monster-table { width: 100%; border-collapse: collapse; }
.monster-table th { text-align: left; padding: 15px; color: #8898aa; font-size: 0.7rem; border-bottom: 1px solid #eee; }
.monster-table td { padding: 12px 15px; border-bottom: 1px solid #f5f5f5; }
.cell-wrapper { display: flex; align-items: center; gap: 10px; }
.avatar-circle { width: 40px; height: 40px; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: white; font-weight: bold; }
.bg-purple { background: #8e44ad; }
.badge-light { background: #e9ecef; padding: 5px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; color: #32325d; }
.status-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.7rem; font-weight: 800; }
.status-badge.active { background: #eafaf1; color: #2dce89; }
.status-badge.inactive { background: #fdedec; color: #f5365c; }
.row-inactive { opacity: 0.6; filter: grayscale(100%); background: #f9f9f9; }
.btn-action { width: 30px; height: 30px; border-radius: 50%; border: none; margin-left: 5px; cursor: pointer; }
.btn-action.edit { background: white; color: #5e72e4; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
.btn-action.delete { background: white; color: #f5365c; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
.btn-action.restore { background: #eafaf1; color: #2dce89; }

/* --- TAGS DE ACCESO --- */
.access-tags { display: flex; gap: 5px; flex-wrap: wrap; }
.tag-access { font-size: 0.65rem; background: #f6f9fc; border: 1px solid #e9ecef; padding: 2px 6px; border-radius: 4px; color: #525f7f; }
.tag-access.full { background: #5e72e4; color: white; border: none; }
.tag-more { font-size: 0.65rem; background: #eee; padding: 2px 6px; border-radius: 4px; color: #889; }

/* --- MODAL SPLIT --- */
.modal-backdrop { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.6); z-index: 1000; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(3px); }
.modal-card { background: white; width: 850px; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.3); display: flex; flex-direction: column; max-height: 90vh; }
.modal-header { padding: 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; background: #f8f9fe; }
.modal-body { flex: 1; overflow-y: auto; padding: 0; }
.split-layout { display: grid; grid-template-columns: 1fr 1.2fr; height: 100%; }

.left-col { padding: 30px; }
.right-col { padding: 30px; background: #f8f9fe; border-left: 1px solid #eee; }
.section-title { margin: 0 0 20px 0; color: #5e72e4; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; font-weight: 800; }

.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-size: 0.85rem; margin-bottom: 5px; font-weight: 600; color: #525f7f; }
.input-styled { width: 100%; padding: 10px; border: 1px solid #e0e0e0; border-radius: 6px; transition: 0.2s; box-sizing: border-box; }
.input-styled:focus { border-color: #5e72e4; box-shadow: 0 2px 10px rgba(94, 114, 228, 0.1); outline: none; }

/* --- PERMISSIONS GRID (SWITCHES) --- */
.permissions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px; }
.permission-card { 
    display: flex; align-items: center; gap: 10px; padding: 10px; 
    background: white; border-radius: 8px; border: 1px solid #e9ecef; 
    cursor: pointer; transition: 0.2s; 
}
.permission-card:hover { border-color: #5e72e4; transform: translateY(-2px); }
.permission-card.active { border-color: #5e72e4; background: #fff; box-shadow: 0 4px 6px rgba(94, 114, 228, 0.1); }
.permission-card.active .perm-name { color: #5e72e4; font-weight: 700; }

.switch-visual { 
    width: 36px; height: 20px; background: #e9ecef; border-radius: 20px; 
    position: relative; transition: 0.3s; 
}
.knob { 
    width: 16px; height: 16px; background: white; border-radius: 50%; 
    position: absolute; top: 2px; left: 2px; transition: 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.2); 
}
/* Estado Activo del Switch */
input:checked + .switch-visual { background: #2dce89; }
input:checked + .switch-visual .knob { transform: translateX(16px); }

.perm-name { font-size: 0.85rem; color: #525f7f; }
.quick-actions { margin-top: 15px; display: flex; gap: 15px; justify-content: flex-end; }
.quick-actions small { color: #5e72e4; cursor: pointer; font-weight: bold; font-size: 0.8rem; text-decoration: underline; }

.modal-footer { padding: 20px; text-align: right; border-top: 1px solid #eee; background: #fff; }
.btn-ghost { background: none; border: none; color: #889; margin-right: 15px; cursor: pointer; font-weight: 600; }
.close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; }
.slide-in-up { animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.fade-in { animation: fadeIn 0.4s; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>