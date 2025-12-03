<template>
  <div class="page-container fade-in">
     <div class="page-header-actions">
       <h3 class="page-title">Categorías</h3>
       <button class="btn-primary" @click="modal = true">+ Nueva</button>
     </div>

     <div class="card-box" style="max-width: 800px;">
       <table class="monster-table">
         <thead><tr><th>Nombre</th><th>Descripción</th><th class="text-right"></th></tr></thead>
         <tbody>
           <tr v-for="c in categorias" :key="c._id">
             <td class="fw-bold">{{ c.nombre }}</td>
             <td class="text-muted">{{ c.descripcion }}</td>
             <td class="text-right"><button class="btn-action delete" @click="eliminar(c._id)">🗑️</button></td>
           </tr>
         </tbody>
       </table>
     </div>

     <div v-if="modal" class="modal-backdrop" @click.self="modal = false">
        <div class="modal-card slide-in-up" style="width: 400px;">
           <div class="modal-header"><h4>Nueva Categoría</h4></div>
           <div class="modal-body">
              <label>Nombre</label> <input v-model="form.nombre" class="input-styled mb-3">
              <label>Descripción</label> <input v-model="form.descripcion" class="input-styled">
           </div>
           <div class="modal-footer">
              <button class="btn-primary full-width" @click="guardar">Guardar</button>
           </div>
        </div>
     </div>
  </div>
</template>

<script setup>
// Lógica idéntica a la que te pasé antes para Categorías, solo cambia el HTML/CSS
import { ref, onMounted } from 'vue';
import api from '../../api/axios';
const categorias = ref([]); const modal = ref(false); const form = ref({});
const cargar = async () => { const {data} = await api.get('/categorias'); categorias.value = data; };
const guardar = async () => { await api.post('/categorias', form.value); modal.value=false; cargar(); };
const eliminar = async (id) => { if(confirm('Borrar?')) await api.delete(`/categorias/${id}`); cargar(); };
onMounted(() => cargar());
</script>