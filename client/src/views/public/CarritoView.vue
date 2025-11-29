<template>
  <div class="checkout-wrapper">
    
    <Transition name="slide-down">
      <div v-if="notification.show" class="argon-alert" :class="notification.type">
        <div class="alert-icon">
          <span v-if="notification.type === 'success'"><i class="fas fa-check-circle"></i> ✅</span>
          <span v-if="notification.type === 'danger'"><i class="fas fa-exclamation-circle"></i> ⛔</span>
          <span v-if="notification.type === 'warning'"><i class="fas fa-bell"></i> ⚠️</span>
        </div>
        <div class="alert-text">
          <strong>{{ getTitle(notification.type) }}</strong> 
          <span class="message">{{ notification.message }}</span>
        </div>
        <button class="close-btn" @click="notification.show = false">×</button>
      </div>
    </Transition>

    <div class="container">
      <h1 class="page-title">🚀 Finalizar Compra</h1>
      
      <div v-if="cart.items.length === 0" class="empty-state fade-in">
          <div class="empty-icon">🛒</div>
          <h2>Tu carrito está vacío</h2>
          <p>Parece que aún no has agregado productos monstruosos.</p>
          <router-link to="/catalogo" class="btn-back">Volver al Catálogo</router-link>
      </div>

      <div v-else class="checkout-grid">
        
        <div class="steps-container">
            
            <div class="step-card" :class="{ active: step === 1, done: step > 1 }">
                <div class="step-header" @click="step = 1">
                    <div class="step-num">1</div>
                    <h3>Identificación del Cliente</h3>
                </div>
                <div class="step-body" v-if="step === 1">
                    <div class="form-group search-group">
                        <select v-model="tipoDoc" class="form-control compact">
                            <option value="DNI">DNI</option>
                            <option value="RUC">RUC</option>
                        </select>
                        <input v-model="numDoc" type="text" class="form-control" placeholder="Nro Documento" maxlength="11">
                        <button @click="buscarClienteApi" class="btn-dark" :disabled="buscando">
                            {{ buscando ? '...' : '🔍' }}
                        </button>
                    </div>
                    <div v-if="clienteNombre" class="client-result">
                        <p><strong>Cliente:</strong> {{ clienteNombre }}</p>
                        <input v-model="clienteDireccion" type="text" class="form-control" placeholder="Dirección de envío">
                        <button class="btn-next" @click="step = 2">Continuar al Pago 👉</button>
                    </div>
                </div>
            </div>

            <div class="step-card" :class="{ active: step === 2 }">
                <div class="step-header">
                    <div class="step-num">2</div>
                    <h3>Método de Pago</h3>
                </div>
                <div class="step-body" v-if="step === 2">
                    
                    <div class="payment-tabs">
                        <button :class="{active: metodoPago === 'TARJETA'}" @click="metodoPago = 'TARJETA'">💳 Tarjeta</button>
                        <button :class="{active: metodoPago === 'CREDITO'}" @click="metodoPago = 'CREDITO'">🏦 Crédito</button>
                    </div>

                    <div v-if="metodoPago === 'TARJETA'" class="card-simulator">
                        <div class="flip-container" :class="{ flipped: isFlipped }">
                            <div class="flipper">
                                <div class="front">
                                    <div class="chip"></div>
                                    <div class="card-number">{{ cardForm.numero || '•••• •••• •••• ••••' }}</div>
                                    <div class="card-holder">{{ cardForm.nombre || 'NOMBRE TITULAR' }}</div>
                                    <div class="card-expiry">{{ cardForm.exp || 'MM/YY' }}</div>
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" class="logo-visa">
                                </div>
                                <div class="back">
                                    <div class="strip"></div>
                                    <div class="cvv-box">{{ cardForm.cvc || '***' }}</div>
                                    <p class="cvv-label">CVV</p>
                                </div>
                            </div>
                        </div>

                        <div class="card-form-inputs">
                            <input v-model="cardForm.numero" type="text" placeholder="Número de Tarjeta" maxlength="19" class="form-control">
                            <input v-model="cardForm.nombre" type="text" placeholder="Nombre en la tarjeta" class="form-control">
                            <div class="row">
                                <input v-model="cardForm.exp" type="text" placeholder="MM/YY" class="form-control">
                                <input v-model="cardForm.cvc" type="text" placeholder="CVV" class="form-control" 
                                    @focus="isFlipped = true" @blur="isFlipped = false" maxlength="3">
                            </div>
                        </div>
                    </div>

                    <div v-if="metodoPago === 'CREDITO'" class="credit-options">
                        <p>Seleccione sus cuotas:</p>
                        <div class="cuotas-grid">
                            <div v-for="c in [1, 3, 6, 12]" :key="c" 
                                 class="cuota-card" :class="{selected: cuotas === c}" @click="cuotas = c">
                                <strong>{{ c }}x</strong>
                                <small>{{ c === 1 ? 'Sin interés' : (c*1.5) + '% interés' }}</small>
                            </div>
                        </div>
                        <div class="total-projection">
                            Pagará: <strong>S/ {{ calcularCuota() }}</strong> mensuales
                        </div>
                    </div>

                    <button @click="procesarCompra" class="btn-pay-final" :disabled="procesando">
                        {{ procesando ? 'Procesando...' : `PAGAR S/ ${cart.totalVenta.toFixed(2)}` }}
                    </button>

                </div>
            </div>

        </div>

        <div class="order-summary">
            <h3>Resumen del Pedido</h3>
            <div class="summary-items">
                <div v-for="item in cart.items" :key="item.sku" class="mini-item">
                    <img :src="`http://localhost:3000${item.imagenes[0]}`">
                    <div>
                        <p class="mini-name">{{ item.nombre }}</p>
                        <small>Cant: {{ item.cantidad }}</small>
                    </div>
                    <span class="mini-price">S/ {{ (item.precio_base * item.cantidad).toFixed(2) }}</span>
                </div>
            </div>
            <div class="summary-total">
                <div class="row"><span>Subtotal:</span> <span>S/ {{ cart.subtotal.toFixed(2) }}</span></div>
                <div class="row"><span>IGV (18%):</span> <span>S/ {{ cart.igv.toFixed(2) }}</span></div>
                <div class="row final"><span>TOTAL:</span> <span>S/ {{ cart.totalVenta.toFixed(2) }}</span></div>
            </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useCartStore } from '../../stores/cart';
import api from '../../api/axios';

const cart = useCartStore();
const step = ref(1);

// Datos UI
const buscando = ref(false);
const procesando = ref(false);
const notification = ref({ show: false, message: '', type: 'success' });

// Datos Formulario
const tipoDoc = ref('DNI');
const numDoc = ref('');
const clienteNombre = ref('');
const clienteDireccion = ref('');
const metodoPago = ref('TARJETA');
const cuotas = ref(1);
const cardForm = ref({ numero: '', nombre: '', exp: '', cvc: '' });
const isFlipped = ref(false);

// --- SISTEMA DE NOTIFICACIONES ARGON STYLE ---
const showToast = (msg, type = 'success') => {
    // Mapeamos tipos de error a clases Argon
    // success -> success (Verde)
    // error -> danger (Rojo)
    // warning -> warning (Naranja)
    const argonType = type === 'error' ? 'danger' : type;
    
    notification.value = { show: true, message: msg, type: argonType };
    
    // Auto ocultar
    setTimeout(() => {
        notification.value.show = false;
    }, 4000);
};

const getTitle = (type) => {
    if (type === 'success') return '¡Éxito!';
    if (type === 'danger') return 'Error';
    return 'Atención';
};

// --- LÓGICA DE NEGOCIO ---

const buscarClienteApi = async () => {
    if (!numDoc.value) return showToast('Ingrese un número de documento', 'warning');
    buscando.value = true;
    try {
        const { data } = await api.post('/clientes/consulta-api', { tipo: tipoDoc.value, numero: numDoc.value });
        if(data) {
            clienteNombre.value = data.nombre || data.razon_social;
            clienteDireccion.value = data.direccion || '';
            showToast('Cliente encontrado correctamente', 'success');
        }
    } catch (error) {
        showToast('No se encontraron datos en RENIEC/SUNAT', 'warning');
    } finally { buscando.value = false; }
};

const calcularCuota = () => {
    let interes = cuotas.value === 1 ? 0 : (cuotas.value * 1.5) / 100;
    return ((cart.totalVenta * (1 + interes)) / cuotas.value).toFixed(2);
};

const procesarCompra = async () => {
    if (!clienteNombre.value) return showToast('Por favor, complete la identificación (Paso 1)', 'warning');
    
    procesando.value = true;

    try {
        let clienteId = 1; 

        // 1. Intentar Registrar Cliente
        try {
            await api.post('/clientes', {
                tipo_documento: tipoDoc.value, numero_documento: numDoc.value,
                razon_social: clienteNombre.value, direccion: clienteDireccion.value,
                email: 'web@cliente.com', telefono: '999000000'
            });
            const res = await api.get('/clientes');
            const nuevo = res.data.find(c => c.numero_documento === numDoc.value);
            if (nuevo) clienteId = nuevo.id;
        } catch (e) {
            console.log("Cliente ya existe, buscando ID...");
            const res = await api.get('/clientes');
            const existente = res.data.find(c => c.numero_documento === numDoc.value);
            if (existente) clienteId = existente.id;
        }

        // 2. Preparar Venta
        const payload = {
            cliente_id: clienteId, 
            usuario_id: 'WEB_USER',
            items: cart.items,
            tipo_pago: metodoPago.value === 'CREDITO' ? 'CREDITO' : 'CONTADO',
            total: cart.totalVenta
        };
        
        // 3. Enviar al Backend
        const { data } = await api.post('/ventas/procesar', payload);

        showToast(`¡Compra Exitosa! Pedido #${data.venta_id}`, 'success');
        
        setTimeout(() => {
            cart.vaciarCarrito();
            window.location.href = '/';
        }, 2500);

    } catch (error) {
        console.error(error);
        const mensaje = error.response?.data?.error || "Error de conexión con el servidor";
        showToast(mensaje, 'danger');
    } finally {
        procesando.value = false;
    }
};
</script>

<style scoped>
.checkout-wrapper { background: #f4f7f6; min-height: 100vh; padding: 40px 20px; font-family: 'Open Sans', sans-serif; position: relative; }
.container { max-width: 1100px; margin: 0 auto; }
.page-title { text-align: center; margin-bottom: 40px; color: #32325d; font-weight: 700; }

/* --- 🔥 ARGON ALERTS CSS 🔥 --- */
.argon-alert {
    position: fixed;
    top: 20px;
    right: 20px; /* O 'left: 50%; transform: translateX(-50%);' para centrar */
    z-index: 10000;
    min-width: 350px;
    padding: 1rem 1.5rem;
    border: 0;
    border-radius: 0.375rem;
    color: #fff;
    display: flex;
    align-items: center;
    box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
    font-weight: 500;
    line-height: 1.5;
}

/* Colores Argon */
.argon-alert.success {
    background-color: #2dce89; /* Verde Vibrante */
    background-image: linear-gradient(315deg, #2dce89 0%, #2dcecc 74%);
}

.argon-alert.danger {
    background-color: #f5365c; /* Rojo Intenso */
    background-image: linear-gradient(315deg, #f5365c 0%, #f56036 74%);
}

.argon-alert.warning {
    background-color: #fb6340; /* Naranja */
    background-image: linear-gradient(315deg, #fb6340 0%, #fbb140 74%);
}

.alert-icon {
    font-size: 1.3rem;
    margin-right: 1rem;
    display: flex;
    align-items: center;
}

.alert-text strong {
    display: block;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.5px;
    opacity: 0.8;
    margin-bottom: 2px;
}

.close-btn {
    margin-left: auto;
    background: transparent;
    border: 0;
    color: #fff;
    font-size: 1.5rem;
    font-weight: 600;
    opacity: 0.6;
    cursor: pointer;
    line-height: 1;
    padding: 0;
    margin-top: -2px;
}
.close-btn:hover { opacity: 1; }

/* Animación Slide Down */
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
.slide-down-enter-from, .slide-down-leave-to { transform: translateY(-50px) scale(0.9); opacity: 0; }

/* --- ESTADO VACÍO --- */
.empty-state { text-align: center; padding: 80px 20px; animation: fadeIn 0.5s; }
.empty-icon { font-size: 5rem; margin-bottom: 20px; opacity: 0.5; }
.btn-back { display: inline-block; margin-top: 20px; padding: 12px 30px; background: #172b4d; color: white; text-decoration: none; border-radius: 30px; font-weight: 600; transition: 0.3s; box-shadow: 0 4px 6px rgba(50,50,93,.11), 0 1px 3px rgba(0,0,0,.08); }
.btn-back:hover { transform: translateY(-1px); box-shadow: 0 7px 14px rgba(50,50,93,.1), 0 3px 6px rgba(0,0,0,.08); }

@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

/* --- RESTO DEL DISEÑO (Manteniendo estructura funcional) --- */
.grid-layout { display: grid; grid-template-columns: 1.6fr 1fr; gap: 30px; }

.step-card { background: white; border-radius: 0.375rem; box-shadow: 0 0 2rem 0 rgba(136, 152, 170, 0.15); margin-bottom: 20px; overflow: hidden; transition: 0.3s; opacity: 0.7; border: 1px solid rgba(0,0,0,.05); }
.step-card.active { opacity: 1; transform: scale(1.005); border-color: #5e72e4; }
.step-card.done { border-left: 5px solid #2dce89; }

.step-header { display: flex; align-items: center; padding: 20px; cursor: pointer; background: #fff; }
.step-num { width: 32px; height: 32px; background: #e9ecef; color: #8898aa; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: bold; margin-right: 15px; transition: 0.3s; }
.active .step-num { background: #5e72e4; color: white; box-shadow: 0 4px 6px rgba(50,50,93,.11), 0 1px 3px rgba(0,0,0,.08); }
.step-header h3 { margin: 0; font-size: 1.1rem; color: #32325d; }

.step-body { padding: 25px; border-top: 1px solid #f0f0f0; }
.form-control { display: block; width: 100%; padding: 0.625rem 0.75rem; font-size: 1rem; font-weight: 400; line-height: 1.5; color: #8898aa; background-color: #fff; border: 1px solid #cad1d7; border-radius: 0.375rem; transition: all 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55); box-sizing: border-box; margin-bottom: 15px; box-shadow: 0 1px 3px rgba(50,50,93,.15), 0 1px 0 rgba(0,0,0,.02); }
.form-control:focus { border-color: #5e72e4; outline: 0; box-shadow: 0 4px 6px rgba(50,50,93,.11), 0 1px 3px rgba(0,0,0,.08); }

.search-group { display: flex; gap: 10px; }
.compact { width: 100px; }
.btn-dark { background: #172b4d; color: white; border: none; padding: 0 20px; border-radius: 0.375rem; cursor: pointer; box-shadow: 0 4px 6px rgba(50,50,93,.11); }
.client-result { background: #f6f9fc; padding: 20px; border-radius: 0.375rem; margin-top: 10px; border: 1px solid #e9ecef; }
.btn-next { background: #5e72e4; color: white; border: none; padding: 12px 20px; border-radius: 0.375rem; margin-top: 15px; cursor: pointer; font-weight: 600; width: 100%; box-shadow: 0 4px 6px rgba(50,50,93,.11); transition: 0.3s; }
.btn-next:hover { transform: translateY(-1px); box-shadow: 0 7px 14px rgba(50,50,93,.1), 0 3px 6px rgba(0,0,0,.08); }

.payment-tabs { display: flex; gap: 15px; margin-bottom: 25px; }
.payment-tabs button { flex: 1; padding: 15px; border: 1px solid #dee2e6; background: white; border-radius: 0.375rem; cursor: pointer; font-weight: 600; color: #8898aa; transition: 0.3s; }
.payment-tabs button.active { background: #5e72e4; color: white; border-color: #5e72e4; box-shadow: 0 4px 6px rgba(50,50,93,.11); }

/* Tarjeta 3D */
.card-simulator { perspective: 1000px; margin-bottom: 20px; }
.flip-container { width: 320px; height: 200px; margin: 0 auto 20px; }
.flipper { position: relative; width: 100%; height: 100%; transition: transform 0.6s; transform-style: preserve-3d; }
.flip-container.flipped .flipper { transform: rotateY(180deg); }
.front, .back { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; border-radius: 15px; color: white; box-shadow: 0 15px 35px rgba(50,50,93,.1), 0 5px 15px rgba(0,0,0,.07); padding: 20px; box-sizing: border-box; }
.front { background: linear-gradient(87deg, #172b4d 0, #1a174d 100%); z-index: 2; transform: rotateY(0deg); display: flex; flex-direction: column; justify-content: space-between; }
.back { background: linear-gradient(87deg, #1a174d 0, #172b4d 100%); transform: rotateY(180deg); padding: 0; }
.chip { width: 50px; height: 35px; background: linear-gradient(135deg, #d4af37, #f1d676); border-radius: 5px; }
.logo-visa { width: 60px; position: absolute; top: 20px; right: 20px; }
.card-number { font-size: 1.4rem; letter-spacing: 2px; font-family: monospace; text-shadow: 0 2px 2px rgba(0,0,0,0.5); }
.card-holder, .card-expiry { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; }

.strip { width: 100%; height: 40px; background: black; margin-top: 20px; }
.cvv-box { background: white; color: black; width: 80%; margin: 10px auto; height: 30px; display: flex; align-items: center; justify-content: flex-end; padding-right: 10px; font-family: monospace; border-radius: 4px; }
.cvv-label { text-align: right; width: 80%; margin: 5px auto 0; font-size: 0.7rem; opacity: 0.7; }

.credit-options { background: #fff9f2; padding: 20px; border-radius: 0.375rem; color: #8a5340; margin-bottom: 20px; border: 1px solid #ffe5d0; }
.cuotas-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 10px; }
.cuota-card { border: 1px solid #dee2e6; padding: 10px; text-align: center; border-radius: 0.375rem; cursor: pointer; background: white; transition: 0.2s; }
.cuota-card:hover { transform: translateY(-2px); box-shadow: 0 4px 6px rgba(50,50,93,.11); }
.cuota-card.selected { border-color: #fb6340; background: #fb6340; color: white; }

.btn-pay-final { width: 100%; background: #2dce89; color: white; padding: 15px; font-size: 1.2rem; font-weight: bold; border: none; border-radius: 0.375rem; margin-top: 20px; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 6px rgba(50,50,93,.11); }
.btn-pay-final:hover { background: #26af74; transform: translateY(-2px); box-shadow: 0 7px 14px rgba(50,50,93,.1); }
.btn-pay-final:disabled { background: #e9ecef; color: #8898aa; cursor: not-allowed; transform: none; box-shadow: none; }

/* Resumen Lateral */
.order-summary { background: white; padding: 30px; border-radius: 0.375rem; height: fit-content; box-shadow: 0 0 2rem 0 rgba(136, 152, 170, 0.15); border: 1px solid rgba(0,0,0,.05); }
.order-summary h3 { color: #32325d; margin-bottom: 20px; }
.mini-item { display: flex; align-items: center; margin-bottom: 15px; border-bottom: 1px dashed #e9ecef; padding-bottom: 10px; }
.mini-item img { width: 50px; height: 50px; object-fit: cover; border-radius: 0.375rem; margin-right: 15px; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
.mini-name { margin: 0; font-size: 0.9rem; font-weight: 600; color: #525f7f; }
.mini-price { margin-left: auto; font-weight: bold; color: #32325d; }
.summary-total .row { display: flex; justify-content: space-between; margin-bottom: 5px; color: #8898aa; font-size: 0.9rem; }
.summary-total .final { font-size: 1.5rem; color: #32325d; font-weight: 800; margin-top: 20px; border-top: 2px solid #e9ecef; padding-top: 15px; }

@media (max-width: 800px) { .grid-layout { grid-template-columns: 1fr; } }
</style>