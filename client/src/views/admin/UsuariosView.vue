<template>
  <div class="page-container">
    <div class="actions-bar">
      <h3>👥 Gestión de Usuarios</h3>
      <button class="btn-primary" @click="mostrarModal = true">+ Crear Usuario</button>
    </div>

    <div class="users-grid">
      <div v-for="user in usuarios" :key="user._id" class="user-card">
        <div class="card-header-user">
          <img :src="user.perfil?.avatar || 'https://i.pravatar.cc/150'" class="avatar">
          <div class="role-badge" :class="user.rol.toLowerCase()">{{ user.rol }}</div>
        </div>
        <div class="card-body-user">
          <h4>{{ user.nombre_completo }}</h4>
          <p class="username">@{{ user.username }}</p>
          <p class="email">{{ user.email || 'Sin email' }}</p>
        </div>
        <div class="card-actions">
          <button class="btn-delete" @click="eliminar(user._id)">Eliminar</button>
        </div>
      </div>
    </div>

    <div v-if="mostrarModal" class="modal-overlay">
      <div class="modal-content">
        <h4>Nuevo Usuario del Sistema</h4>
        
        <div class="form-group">
          <label>Nombre Completo</label>
          <input v-model="form.nombre_completo" type="text">
        </div>
        
        <div class="row">
          <div class="form-group half">
            <label>Usuario (Login)</label>
            <input v-model="form.username" type="text">
          </div>
          <div class="form-group half">
            <label>Contraseña</label>
            <input v-model="form.password" type="password">
          </div>
        </div>

        <div class="row">
          <div class="form-group half">
             <label>Rol</label>
             <select v-model="form.rol">
               <option value="ADMIN">Administrador</option>
               <option value="VENDEDOR">Vendedor</option>
               <option value="ALMACEN">Almacenero</option>
             </select>
          </div>
          <div class="form-group half">
             <label>Avatar (URL)</label>
             <select v-model="form.avatar">
               <option value="https://i.pravatar.cc/150?img=11">Hombre 1</option>
               <option value="https://i.pravatar.cc/150?img=5">Mujer 1</option>
               <option value="https://i.pravatar.cc/150?img=12">Hombre 2</option>
               <option value="https://i.pravatar.cc/150?img=9">Mujer 2</option>
             </select>
          </div>
        </div>

        <div class="modal-footer">
           <button @click="cerrarModal" class="btn-close-modal">Cancelar</button>
           <button @click="guardarUsuario" class="btn-save">Crear Usuario</button>
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
const form = ref({ username: '', password: '', nombre_completo: '', rol: 'VENDEDOR', avatar: 'https://i.pravatar.cc/150?img=11' });

const cargarUsuarios = async () => {
    const { data } = await api.get('/usuarios');
    usuarios.value = data;
};

const guardarUsuario = async () => {
    try {
        await api.post('/usuarios', form.value);
        alert('Usuario creado ✅');
        cerrarModal();
        cargarUsuarios();
    } catch (error) {
        alert(error.response?.data?.message || 'Error');
    }
};

const eliminar = async (id) => {
    if(confirm('¿Seguro de eliminar este usuario?')) {
        await api.delete(`/usuarios/${id}`);
        cargarUsuarios();
    }
};

const cerrarModal = () => mostrarModal.value = false;

onMounted(() => cargarUsuarios());
</script>

<style scoped>
.page-container { padding: 20px; }
.actions-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.btn-primary { background: #3699ff; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; }

/* Grid de Usuarios */
.users-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
.user-card { background: white; border-radius: 12px; padding: 20px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; transition: transform 0.2s; }
.user-card:hover { transform: translateY(-5px); border-color: #3699ff; }

.avatar { width: 80px; height: 80px; border-radius: 50%; border: 3px solid #f0f0f0; margin-bottom: 10px; }
.role-badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; margin-bottom: 15px; }
.role-badge.admin { background: #ffe2e5; color: #f64e60; }
.role-badge.vendedor { background: #c9f7f5; color: #1bc5bd; }
.role-badge.almacen { background: #fff4de; color: #ffa800; }

.card-body-user h4 { margin: 0; font-size: 1.1rem; color: #3f4254; }
.username { color: #b5b5c3; font-size: 0.9rem; margin: 5px 0; }
.email { color: #7e8299; font-size: 0.85rem; }

.card-actions { margin-top: 20px; border-top: 1px dashed #ebedf3; padding-top: 15px; }
.btn-delete { background: #f3f6f9; color: #7e8299; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: 600; }
.btn-delete:hover { background: #ffe2e5; color: #f64e60; }

/* Estilos de Modal (Similares a los anteriores) */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 999; }
.modal-content { background: white; padding: 30px; border-radius: 12px; width: 400px; }
.form-group { margin-bottom: 15px; text-align: left; }
.form-group input, .form-group select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; }
.row { display: flex; gap: 10px; }
.half { flex: 1; }
.modal-footer { margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px; }
.btn-save { background: #1bc5bd; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
.btn-close-modal { background: #f3f6f9; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
</style>