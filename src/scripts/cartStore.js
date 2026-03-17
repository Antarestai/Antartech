// src/scripts/cartStore.js

// Eventos customizados para que los componentes de Astro puedan escuchar cambios
export const CART_UPDATED_EVENT = 'antares_cart_updated';

// Clase Singleton para manejar el carrito
class CartStore {
    constructor() {
        this.items = [];
        this.loadCart();
        this.easterEggTriggered = false;
        this.clearCount = 0; // Para el easter egg de vaciar el carrito

        // Items IDs esperados para el "Full Setup"
        this.antaresProducts = ['antaknob', 'macropad-12-1', 'pc-power-button'];
    }

    // Helper genérico para Toasts
    showToast(emoji, title, message) {
        if (this.easterEggTriggered) return;
        this.easterEggTriggered = true;

        if (typeof document === 'undefined') return;

        const toast = document.createElement('div');
        toast.className = 'fixed top-20 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-indigo-600/90 dark:bg-cyan-600/90 text-white backdrop-blur-xl rounded-2xl shadow-2xl shadow-indigo-500/50 transform -translate-y-10 opacity-0 transition-all duration-500 border border-white/20 max-w-[90vw] sm:max-w-md';
        toast.innerHTML = `
            <span class="text-2xl animate-bounce">${emoji}</span>
            <div class="flex flex-col">
                <span class="font-black text-sm uppercase tracking-wider">${title}</span>
                <span class="text-xs font-medium text-white/80">${message}</span>
            </div>
        `;

        document.body.appendChild(toast);

        // Animate In
        requestAnimationFrame(() => {
            toast.classList.remove('-translate-y-10', 'opacity-0');
        });

        // Animate Out & Remove
        setTimeout(() => {
            toast.classList.add('-translate-y-10', 'opacity-0');
            setTimeout(() => toast.remove(), 500);

            // Cooldown largo para easter eggs
            setTimeout(() => this.easterEggTriggered = false, 15000);
        }, 4000);
    }

    // Cargar desde localStorage
    loadCart() {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('antares_cart');
            if (saved) {
                try {
                    this.items = JSON.parse(saved);
                } catch (e) {
                    this.items = [];
                }
            }
        }
    }

    // Guardar en localStorage y notificar
    saveCart() {
        if (typeof window !== 'undefined') {
            localStorage.setItem('antares_cart', JSON.stringify(this.items));
            window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, { detail: this.items }));
        }
    }

    // Agregar producto
    addItem(product) {
        /* product formato esperado:
           { id: string, title: string, price: number, image: string }
        */
        const existingItem = this.items.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
            if (existingItem.quantity === 5) {
                this.showToast('🥵', '¡Pará un poco!', 'Me estás haciendo laburar demasiado...');
            }
        } else {
            this.items.push({ ...product, quantity: 1 });

            // Check for Full Setup Easter Egg
            const currentIds = this.items.map(i => i.id);
            const hasAll = this.antaresProducts.every(id => currentIds.includes(id));
            if (hasAll && this.items.length === 3) {
                this.showToast('🔥', '¡Full Setup Antares!', 'Te estás armando el set definitivo. ¡Épico!');
            }
        }

        this.saveCart();
    }

    // Actualizar cantidad (sumar/restar)
    updateQuantity(productId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeItem(productId);
            return;
        }

        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            if (newQuantity === 5) {
                this.showToast('🥵', '¡Pará un poco!', 'Me estás haciendo laburar demasiado...');
            }
            this.saveCart();
        }
    }

    // Eliminar producto
    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
    }

    // Vaciar carrito
    clearCart() {
        if (this.items.length > 0) {
            this.clearCount += 1;
            if (this.clearCount === 3) {
                this.showToast('🥲', '¿Otra vez?', 'Me ilusionás y me vaciás el carrito. Mala persona.');
                this.clearCount = 0; // Reset
            }
        }

        this.items = [];
        this.saveCart();
    }

    // Obtener total de items (para el badge del navbar)
    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    // Obtener precio total
    getTotalPrice() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Generar link de WhatsApp
    generateWhatsAppLink() {
        const phoneNumber = "5491165361612"; // Número provisto por el usuario

        if (this.items.length === 0) return `https://wa.me/${phoneNumber}?text=Hola!`;

        let message = `Hola! Quiero armar el siguiente pedido en Antares Tech:%0A%0A`;

        this.items.forEach(item => {
            message += `- ${item.quantity}x ${item.title} ($${item.price.toLocaleString('es-AR')})%0A`;
        });

        message += `%0A*Total estimado: $${this.getTotalPrice().toLocaleString('es-AR')}*`;
        message += `%0A%0AMe avisas cómo seguimos?`;

        // Doble fallback por compatibilidad
        return `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${message}`;
    }
}

// Exportamos una única instancia para todo el cliente
export const cartStore = new CartStore();
