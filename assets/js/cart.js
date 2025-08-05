/**
 * Sistema de Carrito de Compras
 * Gestiona todas las operaciones relacionadas con el carrito de compras.
 */

class ShoppingCart {
    constructor() {
        this.items = [];
        this.discountCode = null;
        this.discountAmount = 0;
        this.initialized = false;
    }

    /**
     * Inicializa el carrito de compras
     */
    init() {
        // Cargar carrito desde localStorage
        this.loadCart();
        
        // Configurar botones "Añadir al carrito"
        this.setupAddToCartButtons();
        
        // Actualizar contador de carrito
        this.updateCartCounter();
        
        // Marcar como inicializado
        this.initialized = true;
    }

    /**
     * Carga los elementos del carrito desde localStorage
     */
    loadCart() {
        const savedCart = localStorage.getItem('infinity-cart');
        if (savedCart) {
            try {
                const cartData = JSON.parse(savedCart);
                this.items = cartData.items || [];
                this.discountCode = cartData.discountCode || null;
                this.discountAmount = cartData.discountAmount || 0;
            } catch (e) {
                console.error('Error loading cart from localStorage:', e);
                this.items = [];
                this.discountCode = null;
                this.discountAmount = 0;
            }
        }
    }

    /**
     * Guarda el estado actual del carrito en localStorage
     */
    saveCart() {
        const cartData = {
            items: this.items,
            discountCode: this.discountCode,
            discountAmount: this.discountAmount
        };
        
        localStorage.setItem('infinity-cart', JSON.stringify(cartData));
        
        // Actualizar el contador del carrito
        this.updateCartCounter();
        
        // Disparar evento personalizado de actualización del carrito
        const event = new CustomEvent('cartUpdated', { detail: this.getCartSummary() });
        document.dispatchEvent(event);
    }

    /**
     * Configura los botones "Añadir al carrito" en la página
     */
    setupAddToCartButtons() {
        const addToCartButtons = document.querySelectorAll('.add-to-cart');
        
        addToCartButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = button.getAttribute('data-product');
                
                if (productId) {
                    // Obtener información del producto
                    const productInfo = this.getProductInfo(productId);
                    
                    if (productInfo) {
                        // Añadir al carrito
                        this.addItem(productInfo);
                        
                        // Mostrar notificación
                        if (window.infinityUtils) {
                            const message = window.i18n && window.i18n.initialized ? 
                                window.i18n.translate('cart.productAdded', {product: productInfo.name}) : 
                                `${productInfo.name} added to cart`;
                            
                            window.infinityUtils.showNotification(message, 'success');
                        }
                    }
                }
            });
        });
    }

    /**
     * Obtiene información sobre un producto específico
     * @param {string} productId - ID del producto
     * @returns {Object|null} - Información del producto o null si no se encuentra
     */
    getProductInfo(productId) {
        // Datos de productos (en un sistema real, esto vendría de una API o base de datos)
        const products = {
            'autoflow': {
                id: 'autoflow',
                name: window.i18n && window.i18n.initialized ? window.i18n.translate('products.autoflow.title') : 'Autoflow',
                price: 49.99,
                image: '/assets/img/products/autoflow/main-thumb.jpg'
            },
            'bulletproof': {
                id: 'bulletproof',
                name: window.i18n && window.i18n.initialized ? window.i18n.translate('products.bulletproof.title') : 'BulletProof',
                price: 39.99,
                image: '/assets/img/products/bulletproof/main-thumb.jpg'
            },
            'securevault': {
                id: 'securevault',
                name: window.i18n && window.i18n.initialized ? window.i18n.translate('products.securevault.title') : 'SecureVault',
                price: 59.99,
                image: '/assets/img/products/securevault/main-thumb.jpg',
                description: 'Almacenamiento ultra-seguro para tus archivos más importantes. Cifrado militar y acceso desde cualquier dispositivo.',
                category: 'storage'
            }
        };
        
        return products[productId] || null;
    }

    /**
     * Añade un elemento al carrito
     * @param {Object} product - Información del producto a añadir
     * @param {number} quantity - Cantidad a añadir (por defecto 1)
     */
    addItem(product, quantity = 1) {
        // Verificar si el producto ya está en el carrito
        const existingItemIndex = this.items.findIndex(item => item.id === product.id);
        
        if (existingItemIndex >= 0) {
            // Incrementar cantidad si ya existe
            this.items[existingItemIndex].quantity += quantity;
        } else {
            // Añadir nuevo elemento
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: quantity
            });
        }
        
        // Guardar cambios
        this.saveCart();
    }

    /**
     * Actualiza la cantidad de un elemento en el carrito
     * @param {string} productId - ID del producto a actualizar
     * @param {number} quantity - Nueva cantidad
     */
    updateItemQuantity(productId, quantity) {
        const itemIndex = this.items.findIndex(item => item.id === productId);
        
        if (itemIndex >= 0) {
            if (quantity > 0) {
                this.items[itemIndex].quantity = quantity;
            } else {
                // Si la cantidad es 0 o negativa, eliminar el elemento
                this.removeItem(productId);
                return;
            }
            
            // Guardar cambios
            this.saveCart();
        }
    }

    /**
     * Elimina un elemento del carrito
     * @param {string} productId - ID del producto a eliminar
     */
    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
    }

    /**
     * Vacía el carrito completamente
     */
    clearCart() {
        this.items = [];
        this.discountCode = null;
        this.discountAmount = 0;
        this.saveCart();
    }

    /**
     * Aplica un código de descuento al carrito
     * @param {string} code - Código de descuento a aplicar
     * @returns {boolean} - true si se aplicó correctamente, false en caso contrario
     */
    applyDiscountCode(code) {
        // Aquí habría una validación real con la API
        // Por ahora simulamos algunos códigos para pruebas
        const validCodes = {
            'WELCOME10': { type: 'percentage', value: 10 },
            'SUMMER25': { type: 'percentage', value: 25 },
            'FLAT20': { type: 'fixed', value: 20 }
        };
        
        const codeUppercase = code.toUpperCase();
        
        if (validCodes[codeUppercase]) {
            const discount = validCodes[codeUppercase];
            this.discountCode = codeUppercase;
            
            // Calcular el monto de descuento
            if (discount.type === 'percentage') {
                this.discountAmount = (this.getSubtotal() * discount.value) / 100;
            } else if (discount.type === 'fixed') {
                this.discountAmount = discount.value;
            }
            
            // No permitir descuentos mayores que el subtotal
            if (this.discountAmount > this.getSubtotal()) {
                this.discountAmount = this.getSubtotal();
            }
            
            this.saveCart();
            return true;
        }
        
        return false;
    }

    /**
     * Elimina el código de descuento actual
     */
    removeDiscountCode() {
        this.discountCode = null;
        this.discountAmount = 0;
        this.saveCart();
    }

    /**
     * Obtiene el subtotal del carrito (sin descuentos ni impuestos)
     * @returns {number} - Subtotal
     */
    getSubtotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    /**
     * Calcula el impuesto a aplicar
     * @param {number} rate - Tasa de impuesto (por defecto 0)
     * @returns {number} - Monto de impuesto
     */
    getTax(rate = 0) {
        const subtotalAfterDiscount = this.getSubtotal() - this.discountAmount;
        return subtotalAfterDiscount * (rate / 100);
    }

    /**
     * Obtiene el total del carrito (subtotal - descuento + impuestos)
     * @param {number} taxRate - Tasa de impuesto a aplicar
     * @returns {number} - Total
     */
    getTotal(taxRate = 0) {
        const subtotal = this.getSubtotal();
        const discount = this.discountAmount;
        const tax = this.getTax(taxRate);
        
        return subtotal - discount + tax;
    }

    /**
     * Obtiene un resumen del estado actual del carrito
     * @returns {Object} - Resumen del carrito
     */
    getCartSummary() {
        return {
            items: this.items,
            itemCount: this.getTotalItems(),
            subtotal: this.getSubtotal(),
            discountCode: this.discountCode,
            discountAmount: this.discountAmount,
            total: this.getTotal()
        };
    }

    /**
     * Obtiene el número total de elementos en el carrito
     * @returns {number} - Cantidad total
     */
    getTotalItems() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }

    /**
     * Actualiza el contador de elementos en el ícono del carrito
     */
    updateCartCounter() {
        const cartCountElement = document.querySelector('.cart-count');
        
        if (cartCountElement) {
            const totalItems = this.getTotalItems();
            cartCountElement.textContent = totalItems.toString();
            
            // Mostrar/ocultar el contador según si hay elementos
            if (totalItems > 0) {
                cartCountElement.style.display = 'flex';
            } else {
                cartCountElement.style.display = 'none';
            }
        }
    }
    
    /**
     * Procesa el checkout del carrito
     * @param {Object} userInfo - Información del usuario para el pedido
     * @returns {Promise<Object>} - Resultado de la operación
     */
    async processCheckout(userInfo) {
        // En un sistema real, esto se comunicaría con una API de backend
        // Aquí simulamos el proceso de forma síncrona
        
        return new Promise((resolve, reject) => {
            // Verificar que haya productos en el carrito
            if (this.items.length === 0) {
                reject(new Error('Cart is empty'));
                return;
            }
            
            // Simular proceso de pago (en un 80% de los casos será exitoso)
            setTimeout(() => {
                const success = Math.random() < 0.8;
                
                if (success) {
                    // Generar un número de orden simulado
                    const orderNumber = 'ORD-' + Date.now().toString().substring(5);
                    
                    // Generar keys para los productos (simulado)
                    const productKeys = this.items.map(item => ({
                        productId: item.id,
                        key: item.id.toUpperCase() + '-' + Math.random().toString(36).substring(2, 10).toUpperCase()
                    }));
                    
                    // Crear objeto de respuesta
                    const orderData = {
                        success: true,
                        orderNumber: orderNumber,
                        orderDate: new Date().toISOString(),
                        customerInfo: userInfo,
                        items: this.items,
                        productKeys: productKeys,
                        subtotal: this.getSubtotal(),
                        discount: this.discountAmount,
                        tax: this.getTax(),
                        total: this.getTotal()
                    };
                    
                    // Limpiar el carrito después de una compra exitosa
                    this.clearCart();
                    
                    resolve(orderData);
                } else {
                    reject(new Error('Payment processing failed. Please try again.'));
                }
            }, 2000); // Simular demora de procesamiento
        });
    }
}

// Crear e inicializar la instancia global
const cart = new ShoppingCart();

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    cart.init();
});

// Exponer la instancia globalmente para uso en otros scripts
window.shoppingCart = cart;