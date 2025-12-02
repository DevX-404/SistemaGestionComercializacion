import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', {
    state: () => ({
        items: [],
        cliente: null,
        tipoVenta: 'CONTADO'
    }),
    getters: {
        totalVenta: (state) => state.items.reduce((acc, item) => acc + (item.precio_base * item.cantidad), 0),
        igv: (state) => state.totalVenta * 0.18,
        subtotal: (state) => state.totalVenta - (state.totalVenta * 0.18)
    },
    actions: {
        agregarProducto(producto) {
            const existente = this.items.find(i => i.sku === producto.sku);
            if (existente) {
                if (existente.cantidad < producto.stock) {
                    existente.cantidad++;
                    return { success: true, message: 'Cantidad actualizada en carrito' };
                } else {
                    return { success: false, message: '¡No hay más stock disponible!' };
                }
            } else {
                this.items.push({ ...producto, cantidad: 1 });
                return { success: true, message: 'Producto agregado al carrito' };
            }
        },
        disminuirCantidad(sku) {
            const item = this.items.find(i => i.sku === sku);
            if (item) {
                item.cantidad--;
                if (item.cantidad <= 0) {
                    this.quitarProducto(sku);
                }
            }
        },
        quitarProducto(sku) {
            this.items = this.items.filter(i => i.sku !== sku);
        },
        vaciarCarrito() {
            this.items = [];
            this.cliente = null;
        }
    }
});