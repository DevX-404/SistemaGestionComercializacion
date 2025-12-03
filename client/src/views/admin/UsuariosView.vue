<template>
  <div class="page-container fade-in">
    <div class="page-header-actions">
      <div class="title-wrapper">
        <h3 class="page-title">Gestión de Usuarios</h3>
        <p class="page-subtitle">Control de acceso y roles</p>
      </div>
      <button class="btn-primary" @click="modal = true">+ Nuevo Usuario</button>
    </div>

    <div class="card-box table-responsive">
      <table class="monster-table">
        <thead><tr><th>Usuario</th><th>Nombre</th><th>Rol</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          <tr v-for="u in usuarios" :key="u._id" :class="{'row-inactive': u.estado === 'INACTIVO'}">
            <td>
               <div class="cell-wrapper">
                  <div class="avatar-circle bg-purple">{{ u.username.charAt(0).toUpperCase() }}</div>
                  <span class="main-text fw-bold">@{{ u.username }}</span>
               </div>
            </td>
            <td>{{ u.nombre_completo }}</td>
            <td><span class="badge-light">{{ u.rol }}</span></td>
            <td><span class="status-badge" :class="u.estado === 'INACTIVO' ? 'inactive' : 'active'">{{ u.estado }}</span></td>
            <td class="text-right">
               <button v-if="u.estado !== 'INACTIVO'" class="btn-action delete" @click="eliminar(u._id)">🗑️</button>
               <span v-else>🔒</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <transition name="modal-fade">
       <div v-if="modal" class="modal-backdrop" @click.self="modal = false">
          <div class="modal-card slide-in-up">
             <div class="modal-header"><h4>Nuevo Usuario</h4><button class="close-btn" @click="modal = false">×</button></div>
             <div class="modal-body">
                <div class="form-group"><label>Username</label><input v-model="form.username" class="input-styled"></div>
                <div class="form-group"><label>Rol</label>
                   <select v-model="form.rol" class="input-styled">
                      <option value="VENDEDOR">Vendedor</option>
                      <option value="ALMACENERO">Almacenero</option>
                      <option value="ADMIN">Admin</option>
                   </select>
                </div>
                <div class="form-group"><label>Nombre Completo</label><input v-model="form.nombre_completo" class="input-styled"></div>
                <div class="form-group"><label>Contraseña</label><input v-model="form.password" type="password" class="input-styled"></div>
             </div>
             <div class="modal-footer"><button class="btn-primary full-width" @click="guardar">Crear Acceso</button></div>
          </div>
       </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api/axios';
const usuarios = ref([]); const modal = ref(false);
const form = ref({ username: '', password: '', nombre_completo: '', rol: 'VENDEDOR' });

const cargar = async () => { const {data} = await api.get('/usuarios'); usuarios.value = data; };
const guardar = async () => { await api.post('/usuarios', form.value); modal.value=false; cargar(); };
const eliminar = async (id) => { if(confirm('¿Revocar acceso?')) { await api.delete(`/usuarios/${id}`); cargar(); }};
onMounted(()=>cargar());
</script>

<style scoped>
/* Copiar mismos estilos de ProveedoresView */
.page-container { padding: 20px; }
.card-box { background: white; border-radius: 15px; padding: 20px; box-shadow: 0 0 2rem rgba(136,152,170,.15); }
.monster-table { width: 100%; border-collapse: collapse; }
.monster-table th { text-align: left; padding: 10px; border-bottom: 1px solid #eee; color: #889; font-size: 0.75rem; text-transform: uppercase; }
.monster-table td { padding: 15px 10px; border-bottom: 1px solid #f5f5f5; }
.avatar-circle { width: 40px; height: 40px; border-radius: 50%; color: white; display: flex; justify-content: center; align-items: center; font-weight: bold; margin-right: 10px; }
.bg-purple { background: #8e44ad; }
.cell-wrapper { display: flex; align-items: center; }
.status-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.7rem; font-weight: 800; }
.status-badge.active { background: #eafaf1; color: #2dce89; }
.status-badge.inactive { background: #fdedec; color: #f5365c; }
.row-inactive { opacity: 0.6; background: #f9f9f9; }
.btn-primary { background: #5e72e4; color: white; border: none; padding: 10px 20px; border-radius: 5px; font-weight: bold; }
.btn-action.delete { background: white; color: #f5365c; border: none; cursor: pointer; }
/* Modal styles */
.modal-backdrop { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(2px); }
.modal-card { background: white; width: 400px; padding: 20px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
.modal-header { display: flex; justify-content: space-between; margin-bottom: 20px; font-weight: bold; }
.input-styled { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; }
.form-group { margin-bottom: 15px; }
.full-width { width: 100%; }
.badge-light { background: #e9ecef; color: #32325d; padding: 5px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
</style>