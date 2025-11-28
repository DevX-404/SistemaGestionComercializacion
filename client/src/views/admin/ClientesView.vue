<template>
  <div class="page-container">
    <div class="actions-bar">
        <h3>Gestión de Clientes</h3>
        <button class="btn-primary" @click="mostrarModal = true">+ Nuevo Cliente</button>
    </div>

    <div class="card-box">
        <table class="monster-table">
            <thead>
                <tr>
                    <th>Documento</th>
                    <th>Nombre / Razón Social</th>
                    <th>Dirección</th>
                    <th>Email</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="c in clientes" :key="c.id">
                    <td>
                        <span :class="['badge', c.tipo_documento === 'RUC' ? 'badge-ruc' : 'badge-dni']">
                            {{ c.tipo_documento }}
                        </span>
                        {{ c.numero_documento }}
                    </td>
                    <td class="fw-bold">{{ c.razon_social }}</td>
                    <td>{{ c.direccion || '-' }}</td>
                    <td>{{ c.email || '-' }}</td>
                    <td>
                        <button class="btn-icon">✏️</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <div v-if="mostrarModal" class="modal-overlay">
        <div class="modal-content">
            <div class="modal-header">
                <h4>Nuevo Cliente</h4>
                <button @click="cerrarModal" class="btn-close">×</button>
            </div>
            
            <div class="modal-body">
                <div class="form-group">
                    <label>Tipo Documento</label>
                    <select v-model="form.tipo_documento">
                        <option value="DNI">DNI (Persona)</option>
                        <option value="RUC">RUC (Empresa)</option>
                    </select>
                </div>

                <div class="form-group search-group">
                    <label>Número Documento</label>
                    <div class="input-wrapper">
                        <input type="text" v-model="form.numero_documento" placeholder="Ingrese número...">
                        <button @click="buscarApi" class="btn-search" :disabled="buscando">
                            {{ buscando ? '⏳' : '🔍 Consultar API' }}
                        </button>
                    </div>
                </div>

                <div class="form-group">
                    <label>Nombre / Razón Social</label>
                    <input type="text" v-model="form.razon_social" :readonly="bloquearCamposApi" class="bg-gray">
                </div>

                <div class="form-group">
                    <label>Dirección</label>
                    <input type="text" v-model="form.direccion">
                </div>
                
                <div class="row">
                    <div class="form-group half">
                        <label>Email</label>
                        <input type="email" v-model="form.email">
                    </div>
                    <div class="form-group half">
                        <label>Teléfono</label>
                        <input type="text" v-model="form.telefono">
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button @click="guardarCliente" class="btn-save">Guardar Cliente</button>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api/axios';

const clientes = ref([]);
const mostrarModal = ref(false);
const buscando = ref(false);
const bloquearCamposApi = ref(false); // Para que no editen lo que trajo la API

const form = ref({
    tipo_documento: 'DNI',
    numero_documento: '',
    razon_social: '',
    direccion: '',
    email: '',
    telefono: ''
});

const cargarClientes = async () => {
    const { data } = await api.get('/clientes');
    clientes.value = data;
};

// --- MAGIA: CONEXIÓN CON TU BACKEND ---
const buscarApi = async () => {
    if (!form.value.numero_documento) return alert('Ingrese un número');
    
    buscando.value = true;
    try {
        const { data } = await api.post('/clientes/consulta-api', {
            tipo: form.value.tipo_documento,
            numero: form.value.numero_documento
        });
        
        // Auto-rellenar formulario
        form.value.razon_social = data.nombre || data.razon_social;
        form.value.direccion = data.direccion || '';
        bloquearCamposApi.value = true; // Bloqueamos para validar que vino de API

    } catch (error) {
        alert('No se encontraron datos en el padrón oficial');
        bloquearCamposApi.value = false;
    } finally {
        buscando.value = false;
    }
};

const guardarCliente = async () => {
    try {
        await api.post('/clientes', form.value);
        alert('Cliente registrado ✅');
        cerrarModal();
        cargarClientes();
    } catch (error) {
        alert('Error al guardar: ' + error.response?.data?.message);
    }
};

const cerrarModal = () => {
    mostrarModal.value = false;
    form.value = { tipo_documento: 'DNI', numero_documento: '', razon_social: '' };
    bloquearCamposApi.value = false;
};

onMounted(() => cargarClientes());
</script>

<style scoped>
.page-container { padding: 20px; }
.actions-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.btn-primary { background: var(--client-primary); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; }

.monster-table { width: 100%; border-collapse: collapse; }
.monster-table th { text-align: left; padding: 15px; color: #a2a5b9; font-weight: 600; border-bottom: 1px solid #eee; }
.monster-table td { padding: 15px; border-bottom: 1px solid #f5f7fb; color: var(--admin-text); }
.badge { padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; margin-right: 8px; }
.badge-dni { background: #e1f0ff; color: #3699ff; }
.badge-ruc { background: #fff4de; color: #ffa800; }
.fw-bold { font-weight: 600; }

/* Modal Styles */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: white; padding: 25px; border-radius: 12px; width: 500px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
.modal-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
.modal-header h4 { margin: 0; }
.btn-close { border: none; background: none; font-size: 1.5rem; cursor: pointer; }

.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; font-weight: 500; font-size: 0.9rem; }
.form-group input, .form-group select { width: 100%; padding: 10px; border: 1px solid #e4e6ef; border-radius: 6px; box-sizing: border-box; }
.bg-gray { background-color: #f3f6f9; }

.input-wrapper { display: flex; gap: 10px; }
.btn-search { background: #8950fc; color: white; border: none; padding: 0 15px; border-radius: 6px; cursor: pointer; white-space: nowrap; }

.row { display: flex; gap: 15px; }
.half { flex: 1; }
.btn-save { width: 100%; background: var(--success); color: white; border: none; padding: 12px; border-radius: 6px; font-weight: bold; cursor: pointer; }
</style>