<template>
  <div class="page-container">
    <div class="actions-bar">
      <h3>🚚 Gestión de Proveedores</h3>
      <button class="btn-primary" @click="mostrarModal = true">+ Nuevo Proveedor</button>
    </div>

    <div class="card-box">
      <table class="monster-table">
        <thead>
          <tr>
            <th>RUC</th>
            <th>Razón Social</th>
            <th>Contacto</th>
            <th>Teléfono</th>
            <th>Dirección</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="proveedores.length === 0">
            <td colspan="5" style="text-align: center; color: #999;">No hay proveedores registrados</td>
          </tr>
          <tr v-for="prov in proveedores" :key="prov.id">
            <td><span class="badge badge-ruc">{{ prov.ruc }}</span></td>
            <td class="fw-bold">{{ prov.razon_social }}</td>
            <td>{{ prov.contacto_nombre || '-' }}</td>
            <td>{{ prov.telefono || '-' }}</td>
            <td>{{ prov.direccion || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="mostrarModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h4>Nuevo Proveedor</h4>
          <button @click="cerrarModal" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group search-group">
            <label>RUC (SUNAT)</label>
            <div class="input-wrapper">
              <input type="text" v-model="form.ruc" maxlength="11" placeholder="Ingrese RUC...">
              <button @click="buscarApiRuc" class="btn-search" :disabled="buscando">
                {{ buscando ? '⏳' : '🔍 SUNAT' }}
              </button>
            </div>
          </div>

          <div class="form-group">
            <label>Razón Social</label>
            <input v-model="form.razon_social" type="text" :readonly="bloqueadoPorApi" class="bg-gray">
          </div>

          <div class="row">
            <div class="form-group half">
              <label>Contacto (Nombre)</label>
              <input v-model="form.contacto_nombre" type="text">
            </div>
            <div class="form-group half">
              <label>Teléfono</label>
              <input v-model="form.telefono" type="text">
            </div>
          </div>

          <div class="form-group">
            <label>Dirección</label>
            <input v-model="form.direccion" type="text">
          </div>
        </div>
        <div class="modal-footer">
          <button @click="guardarProveedor" class="btn-save">Guardar en PostgreSQL</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api/axios';

const proveedores = ref([]);
const mostrarModal = ref(false);
const form = ref({ ruc: '', razon_social: '', contacto_nombre: '', telefono: '', direccion: '' });
const buscando = ref(false);
const bloqueadoPorApi = ref(false);

const cargarProveedores = async () => {
  try {
    const { data } = await api.get('/proveedores');
    proveedores.value = data;
  } catch (error) {
    console.error(error);
  }
};

const guardarProveedor = async () => {
  if (!form.value.ruc || !form.value.razon_social) return alert('RUC y Razón Social requeridos');
  try {
    await api.post('/proveedores', form.value);
    alert('Proveedor guardado ✅');
    cerrarModal();
    cargarProveedores();
  } catch (error) {
    alert('Error: ' + (error.response?.data?.message || 'Error al guardar'));
  }
};

const buscarApiRuc = async () => {
    if (!form.value.ruc || form.value.ruc.length !== 11) {
        return alert('Ingrese un RUC válido de 11 dígitos');
    }
    
    buscando.value = true;
    try {
        // Reutilizamos el endpoint de clientes que ya busca en SUNAT
        // OJO: Asegúrate de que tu backend soporte esto o usa el servicio directo
        const { data } = await api.post('/clientes/consulta-api', {
            tipo: 'RUC',
            numero: form.value.ruc
        });

        if (data) {
            form.value.razon_social = data.razon_social;
            form.value.direccion = data.direccion;
            bloqueadoPorApi.value = true;
            alert('¡Proveedor encontrado en SUNAT!');
        }
    } catch (error) {
        console.error(error);
        alert('No se encontró el RUC o hubo un error de conexión');
        bloqueadoPorApi.value = false;
    } finally {
        buscando.value = false;
    }
};

const cerrarModal = () => {
  mostrarModal.value = false;
  form.value = { ruc: '', razon_social: '', contacto_nombre: '', telefono: '', direccion: '' };
  bloqueadoPorApi.value = false;
};

onMounted(() => cargarProveedores());
</script>

<style scoped>
/* Reutilizamos estilos previos */
.page-container {
  padding: 20px;
}

.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.btn-primary {
  background: #8950fc;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.card-box {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.monster-table {
  width: 100%;
  border-collapse: collapse;
}

.monster-table th {
  text-align: left;
  padding: 15px;
  color: #a2a5b9;
  border-bottom: 1px solid #eee;
}

.monster-table td {
  padding: 15px;
  border-bottom: 1px solid #f5f7fb;
  color: #3f4254;
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
}

.badge-ruc {
  background: #fff4de;
  color: #ffa800;
}

.fw-bold {
  font-weight: 600;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 25px;
  border-radius: 12px;
  width: 450px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.btn-close {
  border: none;
  background: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #e4e6ef;
  border-radius: 6px;
  box-sizing: border-box;
}

.row {
  display: flex;
  gap: 15px;
}

.half {
  flex: 1;
}

.btn-save {
  width: 100%;
  background: #1bc5bd;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}
</style>