<template>
  <div class="payment-portal fade-in">
    <div class="container">
      
      <div class="portal-header">
         <h1>Portal de Pagos</h1>
         <p>Consulta y paga tus cuotas pendientes de forma segura.</p>
      </div>

      <!-- BUSCADOR -->
      <div class="search-section card-box">
         <label>Ingresa tu Documento (DNI / RUC)</label>
         <div class="search-row">
            <input v-model="documento" placeholder="Ej: 45889922" @keyup.enter="consultarDeuda" class="input-hero">
            <button @click="consultarDeuda" class="btn-hero" :disabled="cargando">
               {{ cargando ? 'Buscando...' : 'Consultar Deuda 🔎' }}
            </button>
         </div>
      </div>

      <!-- RESULTADOS -->
      <div v-if="resultado" class="results-section slide-up">
         
         <div class="client-welcome">
            Hola, <strong>{{ resultado.cliente }}</strong>. Estas son tus cuentas pendientes:
         </div>

         <div class="accounts-grid">
            <div v-for="cuenta in resultado.cuentas" :key="cuenta.id" class="account-card">
               <div class="acc-header">
                  <div>
                     <h5>Crédito #{{ cuenta.id }}</h5>
                     <small>Emisión: {{ formatearFecha(cuenta.fecha_emision) }}</small>
                  </div>
                  <div class="debt-badge">Debe: S/ {{ cuenta.saldo_pendiente }}</div>
               </div>
               
               <div class="acc-body">
                  <table class="cuotas-table">
                     <thead>
                        <tr>
                           <th>Cuota</th>
                           <th>Vence</th>
                           <th>Monto</th>
                           <th>Mora</th>
                           <th>Total</th>
                           <th class="text-right">Estado</th>
                        </tr>
                     </thead>
                     <tbody>
                        <tr v-for="(c, index) in cuenta.cuotas" :key="c.numero_cuota" :class="getRowClass(c, index, cuenta.cuotas)">
                           <td><span class="circle">{{ c.numero_cuota }}</span></td>
                           
                           <!-- Fecha -->
                           <td :class="{'text-danger fw-bold': c.dias_retraso > 0 && c.estado !== 'PAGADO'}">
                              {{ formatearFecha(c.fecha_vencimiento) }}
                              <span v-if="c.dias_retraso > 0 && c.estado !== 'PAGADO'" class="delay-tag">
                                 {{ c.dias_retraso }}d atraso
                              </span>
                           </td>
                           
                           <td>S/ {{ c.monto_cuota }}</td>
                           
                           <!-- Mora -->
                           <td :class="c.interes_mora > 0 ? 'text-danger' : 'text-muted'">
                              {{ c.interes_mora > 0 ? '+ S/ ' + c.interes_mora : '-' }}
                           </td>
                           
                           <td class="fw-bold">S/ {{ c.total_a_pagar }}</td>
                           
                           <!-- BOTÓN DE ACCIÓN INTELIGENTE -->
                           <td class="text-right">
                              <span v-if="c.estado === 'PAGADO'" class="badge-paid">✅ PAGADO</span>
                              
                              <button 
                                v-else-if="esPagable(index, cuenta.cuotas)" 
                                class="btn-pay-sm" 
                                @click="iniciarPago(c, cuenta.id)"
                              >
                                 Pagar Ahora ➔
                              </button>
                              
                              <span v-else class="badge-locked" title="Pague la cuota anterior primero">
                                 🔒 Bloqueado
                              </span>
                           </td>
                        </tr>
                     </tbody>
                  </table>
               </div>
            </div>
         </div>
      </div>

      <div v-if="mensaje" class="alert-box slide-up">{{ mensaje }}</div>
    </div>

    <!-- MODAL PAGO (Igual que antes) -->
    <transition name="modal-fade">
      <div v-if="modalPago" class="modal-backdrop" @click.self="modalPago = false">
         <div class="modal-card slide-in-up">
            <div class="modal-header bg-dark text-white">
               <h4>Confirmar Pago</h4>
               <button class="close-btn white" @click="modalPago = false">×</button>
            </div>
            <div class="modal-body">
               <div class="pay-summary">
                  <p>Pagando Cuota <strong>#{{ pagoSeleccionado.cuota.numero_cuota }}</strong></p>
                  <h1 class="amount">S/ {{ pagoSeleccionado.cuota.total_a_pagar }}</h1>
               </div>
               
               <div class="payment-options">
                  <label class="method" :class="{active: metodoPago==='TARJETA'}">
                      <input type="radio" v-model="metodoPago" value="TARJETA"> 💳 Tarjeta
                  </label>
                  <label class="method" :class="{active: metodoPago==='YAPE'}">
                      <input type="radio" v-model="metodoPago" value="YAPE"> 📱 Yape
                  </label>
               </div>
               <!-- (Resto del formulario igual) -->
                 <div v-if="metodoPago === 'TARJETA'" class="card-form mt-3 fade-in">
                  <div class="form-group">
                      <label>Número de Tarjeta</label>
                      <input placeholder="0000 0000 0000 0000" class="input-styled" maxlength="19">
                  </div>
                  <div class="row mt-2">
                     <div class="form-group half"><label>Expiración</label><input placeholder="MM/YY" class="input-styled"></div>
                     <div class="form-group half"><label>CVC</label><input placeholder="123" class="input-styled"></div>
                  </div>
               </div>
               <div v-else class="yape-info fade-in mt-3">
                   <p>Escanea el QR:</p>
                   <div class="qr-placeholder">QR</div>
               </div>
            </div>
            <div class="modal-footer">
               <button class="btn-success full-width" @click="procesarPago" :disabled="procesando">
                  {{ procesando ? 'Procesando...' : 'REALIZAR PAGO' }}
               </button>
            </div>
         </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import api from '../../api/axios';

const documento = ref('');
const resultado = ref(null);
const mensaje = ref('');
const cargando = ref(false);
const modalPago = ref(false);
const pagoSeleccionado = ref({});
const procesando = ref(false);
const metodoPago = ref('TARJETA');

// --- LÓGICA SECUENCIAL ---
// Verifica si esta cuota es la que toca pagar (la primera pendiente)
const esPagable = (index, listaCuotas) => {
    // 1. Si ya está pagada, no es pagable (ya se pagó)
    if (listaCuotas[index].estado === 'PAGADO') return false;

    // 2. Si es la primera de la lista (index 0), SÍ se puede pagar
    if (index === 0) return true;

    // 3. Si no es la primera, verificamos si la ANTERIOR está pagada
    const cuotaAnterior = listaCuotas[index - 1];
    return cuotaAnterior.estado === 'PAGADO';
};

// Estilo visual para filas bloqueadas
const getRowClass = (c, index, lista) => {
    if (c.estado === 'PAGADO') return 'row-pagada';
    if (!esPagable(index, lista)) return 'row-bloqueada'; // Grisáceo
    return 'row-activa'; // La que toca pagar
};

const consultarDeuda = async () => {
    if(!documento.value) return;
    cargando.value = true;
    resultado.value = null;
    mensaje.value = '';

    try {
        const { data } = await api.post('/cuentas/consulta-publica', { documento: documento.value });
        if (data.encontrado) resultado.value = data;
        else mensaje.value = "No se encontraron deudas pendientes.";
    } catch(e) { mensaje.value = "Error de conexión."; } 
    finally { cargando.value = false; }
};

const iniciarPago = (cuota, cuentaId) => {
    pagoSeleccionado.value = { cuota, cuentaId };
    modalPago.value = true;
};

const procesarPago = async () => {
    if (!pagoSeleccionado.value.cuota) return;
    procesando.value = true; 

    const payload = {
        idCuota: pagoSeleccionado.value.cuota.id,
        idCuenta: pagoSeleccionado.value.cuentaId,
        monto: parseFloat(pagoSeleccionado.value.cuota.total_a_pagar)
    };

    try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulación red
        const { data } = await api.post('/cuentas/pagar-publico', payload);
        if (data.success) {
            alert("✅ Pago Exitoso");
            modalPago.value = false;
            consultarDeuda(); // Recarga para desbloquear la siguiente cuota
        }
    } catch (e) { alert("Error al pagar"); } 
    finally { procesando.value = false; }
};

const formatearFecha = (f) => new Date(f).toLocaleDateString('es-PE');
</script>

<style scoped>
/* Mismos estilos base de antes + Nuevos estados */
.payment-portal { padding: 50px 20px; min-height: 100vh; background: #f8f9fe; font-family: 'Segoe UI', sans-serif; }
.container { max-width: 900px; margin: 0 auto; }
.portal-header { text-align: center; margin-bottom: 40px; }
.portal-header h1 { color: #172b4d; font-weight: 800; margin: 0; }

/* Cards */
.search-section { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); text-align: center; margin-bottom: 30px; }
.search-row { display: flex; gap: 10px; justify-content: center; max-width: 500px; margin: 0 auto; margin-top: 15px; }
.input-hero { flex: 1; padding: 15px; border: 2px solid #e9ecef; border-radius: 30px; font-size: 1.1rem; text-align: center; font-weight: bold; outline: none; }
.input-hero:focus { border-color: #5e72e4; }
.btn-hero { background: linear-gradient(87deg, #5e72e4 0, #825ee4 100%); color: white; border: none; padding: 0 30px; border-radius: 30px; font-weight: bold; cursor: pointer; transition: 0.2s; }
.btn-hero:disabled { opacity: 0.7; }

/* Resultados */
.account-card { background: white; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; margin-bottom: 30px; }
.acc-header { background: #f6f9fc; padding: 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; }
.acc-header h5 { margin: 0; font-weight: 800; color: #32325d; }
.debt-badge { background: #fdedec; color: #f5365c; padding: 5px 15px; border-radius: 20px; font-weight: bold; }

.cuotas-table { width: 100%; border-collapse: collapse; }
.cuotas-table th { text-align: left; padding: 15px 20px; font-size: 0.8rem; color: #889; text-transform: uppercase; }
.cuotas-table td { padding: 15px 20px; font-size: 0.9rem; color: #525f7f; border-bottom: 1px solid #f9f9f9; vertical-align: middle; }

/* ESTADOS DE FILA */
.row-pagada { background-color: #fafffc; opacity: 0.6; }
.row-pagada td { color: #aaa; }
.row-bloqueada { background-color: #fcfcfc; color: #aaa; }
.row-activa { background-color: white; }

/* BADGES Y BOTONES */
.btn-pay-sm { background: #2dce89; color: white; border: none; padding: 8px 20px; border-radius: 20px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 6px rgba(45,206,137,0.2); transition: 0.2s; }
.btn-pay-sm:hover { transform: translateY(-2px); box-shadow: 0 7px 14px rgba(45,206,137,0.3); }

.badge-paid { color: #2dce89; font-weight: 800; font-size: 0.8rem; border: 1px solid #2dce89; padding: 5px 10px; border-radius: 15px; }
.badge-locked { color: #adb5bd; font-weight: 600; font-size: 0.8rem; background: #f6f9fc; padding: 5px 10px; border-radius: 15px; }

.circle { background: #5e72e4; color: white; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-weight: bold; }
.delay-tag { background: #f5365c; color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 5px; margin-left: 5px; font-weight: bold; }

/* Modal */
.modal-backdrop { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.6); z-index: 2000; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(4px); }
.modal-card { background: white; width: 450px; border-radius: 15px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
.modal-header { padding: 20px; background: #172b4d; color: white; display: flex; justify-content: space-between; align-items: center; }
.modal-body { padding: 30px; }
.pay-summary { text-align: center; background: #f8f9fe; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
.amount { font-size: 2.5rem; color: #2dce89; font-weight: 800; margin: 5px 0; }

.payment-options { display: flex; gap: 10px; justify-content: center; margin-bottom: 20px; }
.method { border: 2px solid #eee; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 600; color: #555; transition: 0.2s; }
.method.active { border-color: #5e72e4; background: #f4f5fe; color: #5e72e4; }
.method input { display: none; }

.input-styled { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 10px; outline: none; }
.row { display: flex; gap: 10px; }
.half { width: 50%; }
.yape-info { text-align: center; background: #fafafa; padding: 20px; border-radius: 10px; border: 1px dashed #ccc; }
.qr-placeholder { width: 100px; height: 100px; background: #172b4d; color: white; display: flex; align-items: center; justify-content: center; margin: 10px auto; font-weight: bold; border-radius: 10px; }

.btn-success { background: #2dce89; color: white; border: none; padding: 15px; width: 100%; font-weight: bold; border-radius: 8px; cursor: pointer; font-size: 1rem; }
.close-btn { background: none; border: none; font-size: 1.5rem; color: white; cursor: pointer; }

/* Animaciones */
.fade-in { animation: fadeIn 0.5s; } .slide-up { animation: slideUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1); }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
</style>