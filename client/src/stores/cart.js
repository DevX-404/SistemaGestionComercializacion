import { defineStore } from 'pinia';
import api from '../api/axios'; // Importamos axios configurado

export const useCartStore = defineStore('cart', {
    state: () => ({
        items: [],
        cliente_id: 1, // ID temporal (luego lo haremos dinámico con el buscador de clientes)
        usuario_id: 'admin_id_mongo', // Simulación del usuario logueado
        tipoVenta: 'CONTADO'
    }),
    getters: {
        totalVenta: (state) => state.items.reduce((acc, i) => acc + (i.precio_base * i.cantidad), 0),
        igv: (state) => state.totalVenta * 0.18,
        subtotal: (state) => state.totalVenta - (state.totalVenta * 0.18)
    },
    actions: {
        agregarProducto(producto) {
            const existente = this.items.find(i => i.sku === producto.sku);
            if (existente) {
                 // Validacion simple de stock visual
                if (existente.cantidad < producto.stock) existente.cantidad++;
                else alert('Stock insuficiente');
            } else {
                this.items.push({ ...producto, cantidad: 1 });
            }
        },
        quitarProducto(sku) {
            this.items = this.items.filter(i => i.sku !== sku);
        },
        
        // --- LA NUEVA FUNCIÓN PARA VENDER ---
        async procesarVenta() {
            if (this.items.length === 0) return alert('El carrito está vacío');

            try {
                const payload = {
                    cliente_id: this.cliente_id,
                    usuario_id: this.usuario_id,
                    items: this.items,
                    tipo_pago: this.tipoVenta,
                    total: this.totalVenta
                };

                const response = await api.post('/ventas/procesar', payload);
                
                alert(`✅ ¡Venta registrada! ID: ${response.data.venta_id}`);
                
                // Limpiar carrito y recargar página (o recargar inventario)
                this.items = [];
                window.location.reload(); 

            } catch (error) {
                console.error(error);
                alert('❌ Error al procesar la venta');
            }
        }
    }
});