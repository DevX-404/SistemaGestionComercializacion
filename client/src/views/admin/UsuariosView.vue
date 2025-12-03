<template>
  <div class="page-container fade-in">
    <div class="page-header-actions">
      <div class="title-wrapper">
        <h3 class="page-title">Usuarios del Sistema</h3>
        <p class="page-subtitle">Control de accesos y roles de seguridad</p>
      </div>
      <button class="btn-primary" @click="modal = true">+ Nuevo Usuario</button>
    </div>

    <div class="card-box table-responsive">
      <table class="monster-table">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Nombre Completo</th>
            <th>Rol / Perfil</th>
            <th>Estado</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in usuarios" :key="u._id">
            <td>
              <div class="cell-wrapper">
                <div class="avatar-circle bg-purple">{{ u.username.charAt(0).toUpperCase() }}</div>
                <span class="main-text fw-bold">@{{ u.username }}</span>
              </div>
            </td>
            <td>{{ u.nombre_completo }}</td>
            <td><span class="badge-light">{{ u.rol }}</span></td>
            <td><span class="status-dot success"></span> Activo</td>
            <td class="text-right">
               <button class="btn-action delete" @click="eliminar(u._id)">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <transition name="modal-fade">
       <div v-if="modal" class="modal-backdrop" @click.self="modal = false">
          <div class="modal-card slide-in-up">
            <div class="modal-header"><h4>Nuevo Usuario</h4></div>
            <div class="modal-body">
                <div class="form-grid">
                   <div class="form-group"><label>Username</label><input v-model="form.username" class="input-styled"></div>
                   <div class="form-group"><label>Rol</label>
                      <select v-model="form.rol" class="input-styled">
                          <option value="ADMIN">Administrador</option>
                          <option value="VENDEDOR">Vendedor</option>
                          <option value="ALMACENERO">Almacenero</option>
                      </select>
                   </div>
                   <div class="form-group full"><label>Nombre Completo</label><input v-model="form.nombre_completo" class="input-styled"></div>
                   <div class="form-group full"><label>Contraseña</label><input v-model="form.password" type="password" class="input-styled"></div>
                </div>
            </div>
            <div class="modal-footer">
               <button class="btn-ghost" @click="modal = false">Cancelar</button>
               <button class="btn-primary" @click="guardar">Crear Usuario</button>
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
const form = ref({ username: '', password: '', nombre_completo: '', rol: 'VENDEDOR' });

const cargar = async () => { const {data} = await api.get('/usuarios'); usuarios.value = data; };
const guardar = async () => { 
    await api.post('/usuarios', form.value); 
    modal.value = false; cargar(); form.value = { rol: 'VENDEDOR' }; 
};
const eliminar = async (id) => { if(confirm('Eliminar?')) await api.delete(`/usuarios/${id}`); cargar(); };

onMounted(() => cargar());
</script>

<style scoped>
/* Estilos heredados + específico de usuario */
.bg-purple { background: #8e44ad; }
.page-container { padding: 10px; }

/* HEADER */
.page-header-actions {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;
}
.page-title { margin: 0; font-size: 1.5rem; color: #32325d; font-weight: 700; }
.page-subtitle { margin: 5px 0 0; color: #8898aa; font-size: 0.9rem; }

.actions-wrapper { display: flex; gap: 15px; }
.search-input-group {
  background: white; border-radius: 30px; padding: 8px 15px; box-shadow: 0 1px 3px rgba(50,50,93,.15);
  display: flex; align-items: center;
}
.search-input-group input { border: none; outline: none; margin-left: 10px; color: #525f7f; }
.btn-pulse { animation: pulse-shadow 2s infinite; }
@keyframes pulse-shadow { 0% { box-shadow: 0 0 0 0 rgba(94, 114, 228, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(94, 114, 228, 0); } 100% { box-shadow: 0 0 0 0 rgba(94, 114, 228, 0); } }

/* TABLA ESTILIZADA */
.cell-wrapper { display: flex; align-items: center; gap: 15px; }
.avatar-circle { width: 40px; height: 40px; background: linear-gradient(87deg, #11cdef 0, #1171ef 100%); color: white; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: bold; box-shadow: 0 4px 6px rgba(50,50,93,.11); }
.cell-text { display: flex; flex-direction: column; }
.main-text { font-weight: 600; color: #32325d; font-size: 0.9rem; }
.sub-text { font-size: 0.75rem; color: #8898aa; }

.badge-light { background: #e9ecef; color: #32325d; padding: 5px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
.status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 5px; }
.status-dot.active { background: #2dce89; }

.btn-action { width: 30px; height: 30px; border-radius: 50%; border: none; cursor: pointer; margin-left: 5px; transition: 0.2s; display: inline-flex; align-items: center; justify-content: center; }
.btn-action.edit { background: #fff; color: #5e72e4; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
.btn-action.edit:hover { background: #5e72e4; color: white; }
.btn-action.delete { background: #fff; color: #f5365c; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }

/* MODAL BONITO */
.modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 999; display: flex; justify-content: center; align-items: center; }
.modal-card { background: white; width: 550px; border-radius: 15px; box-shadow: 0 15px 35px rgba(50,50,93,.2); overflow: hidden; }
.modal-header { padding: 20px; background: #f8f9fe; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; }
.modal-header h4 { margin: 0; color: #32325d; }
.close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #8898aa; }

.modal-body { padding: 30px; }
.sunat-box { background: #f6f9fc; padding: 15px; border-radius: 10px; margin-bottom: 20px; border: 1px dashed #dee2e6; }
.input-group-merged { display: flex; gap: 10px; }
.input-group-merged select, .input-group-merged input { border: 1px solid #dee2e6; padding: 10px; border-radius: 5px; outline: none; }
.btn-sunat { background: #5e72e4; color: white; border: none; padding: 0 15px; border-radius: 5px; cursor: pointer; font-weight: 600; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.form-group.full { grid-column: span 2; }
.form-group label { display: block; margin-bottom: 8px; color: #525f7f; font-size: 0.85rem; font-weight: 600; }
.input-styled { width: 100%; padding: 10px; border: 1px solid #e9ecef; border-radius: 5px; background: #fcfcfc; transition: 0.2s; box-sizing: border-box; }
.input-styled:focus { border-color: #5e72e4; background: white; box-shadow: 0 0 0 3px rgba(94,114,228,.1); outline: none; }

.modal-footer { padding: 20px; background: #f8f9fe; text-align: right; border-top: 1px solid #f0f0f0; }
.btn-ghost { background: transparent; border: none; color: #8898aa; font-weight: 600; margin-right: 15px; cursor: pointer; }

/* Animación Modal */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.slide-in-up { animation: slideUpModal 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes slideUpModal { from { transform: translateY(50px) scale(0.9); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
</style>