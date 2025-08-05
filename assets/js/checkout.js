/**
 * Infinity Ascend Software - Funcionalidades de la página de checkout
 */

document.addEventListener('DOMContentLoaded', function() {
    // Verificar si el carrito está vacío, si es así redirigir al carrito
    if (window.shoppingCart && window.shoppingCart.getTotalItems() === 0) {
        window.location.href = '/pages/cart.html';
        return;
    }
    
    // Inicializar el proceso de checkout
    initCheckout();
});

/**
 * Inicializa el proceso de checkout
 */
function initCheckout() {
    // Referencia a los elementos del DOM
    const checkoutSteps = document.querySelectorAll('.checkout-step');
    const nextButtons = document.querySelectorAll('.next-step');
    const prevButtons = document.querySelectorAll('.prev-step');
    const editButtons = document.querySelectorAll('.edit-section');
    const progressSteps = document.querySelectorAll('.progress-step');
    const paymentMethods = document.querySelectorAll('.payment-method');
    const cardPaymentForm = document.getElementById('card-payment-form');
    const cryptoPaymentInfo = document.getElementById('crypto-payment-info');
    const confirmPurchaseButton = document.getElementById('confirm-purchase');
    const termsCheckbox = document.getElementById('terms-checkbox');
    
    // Inicializar datos
    loadCountries();
    updateCheckoutSummary();
    
    // Estado actual del proceso
    let currentStep = 1;
    
    /**
     * Cambia al siguiente paso del proceso
     */
    function goToNextStep() {
        if (currentStep < checkoutSteps.length) {
            // Validar el paso actual antes de avanzar
            if (validateStep(currentStep)) {
                if (currentStep === 2) {
                    // Actualizar resumen de revisión antes de mostrar paso 3
                    updateReviewSummary();
                }
                
                // Ocultar paso actual y mostrar siguiente
                checkoutSteps[currentStep - 1].style.display = 'none';
                checkoutSteps[currentStep].style.display = 'block';
                
                // Actualizar progreso
                progressSteps[currentStep - 1].classList.remove('active');
                progressSteps[currentStep - 1].classList.add('completed');
                progressSteps[currentStep].classList.add('active');
                
                // Incrementar paso actual
                currentStep++;
                
                // Scroll al inicio del formulario
                window.scrollTo({
                    top: document.querySelector('.form-header').offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        }
    }
    
    /**
     * Vuelve al paso anterior
     */
    function goToPreviousStep() {
        if (currentStep > 1) {
            // Ocultar paso actual y mostrar anterior
            checkoutSteps[currentStep - 1].style.display = 'none';
            checkoutSteps[currentStep - 2].style.display = 'block';
            
            // Actualizar progreso
            progressSteps[currentStep - 1].classList.remove('active');
            progressSteps[currentStep - 2].classList.remove('completed');
            progressSteps[currentStep - 2].classList.add('active');
            
            // Decrementar paso actual
            currentStep--;
            
            // Scroll al inicio del formulario
            window.scrollTo({
                top: document.querySelector('.form-header').offsetTop - 80,
                behavior: 'smooth'
            });
        }
    }
    
    /**
     * Va a un paso específico
     * @param {number} step - Número de paso al que ir
     */
    function goToStep(step) {
        if (step >= 1 && step <= checkoutSteps.length) {
            // Ocultar paso actual
            checkoutSteps[currentStep - 1].style.display = 'none';
            
            // Mostrar paso solicitado
            checkoutSteps[step - 1].style.display = 'block';
            
            // Actualizar progreso
            progressSteps.forEach((stepEl, index) => {
                stepEl.classList.remove('active', 'completed');
                if (index < step - 1) {
                    stepEl.classList.add('completed');
                } else if (index === step - 1) {
                    stepEl.classList.add('active');
                }
            });
            
            // Actualizar paso actual
            currentStep = step;
            
            // Scroll al inicio del formulario
            window.scrollTo({
                top: document.querySelector('.form-header').offsetTop - 80,
                behavior: 'smooth'
            });
        }
    }
    
    /**
     * Valida los campos del paso actual
     * @param {number} step - Número del paso a validar
     * @returns {boolean} - true si los campos son válidos, false si no
     */
    function validateStep(step) {
        let isValid = true;
        
        if (step === 1) {
            // Validar información personal y de facturación
            const requiredFields = [
                'first-name', 'last-name', 'email',
                'country', 'address', 'city', 'zip-code'
            ];
            
            requiredFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (!field.value.trim()) {
                    field.classList.add('error');
                    isValid = false;
                } else {
                    field.classList.remove('error');
                }
            });
            
            // Validar formato de email
            const emailField = document.getElementById('email');
            if (emailField.value.trim() && !window.infinityUtils.isValidEmail(emailField.value.trim())) {
                emailField.classList.add('error');
                isValid = false;
            }
            
            if (!isValid) {
                window.infinityUtils.showNotification(
                    window.i18n && window.i18n.initialized ? 
                        window.i18n.translate('checkout.requiredFields') : 
                        'Por favor, completa todos los campos requeridos',
                    'error'
                );
            }
        } else if (step === 2) {
            // Validar método de pago
            const selectedPaymentMethod = document.querySelector('input[name="payment-method"]:checked');
            
            if (!selectedPaymentMethod) {
                isValid = false;
                window.infinityUtils.showNotification(
                    window.i18n && window.i18n.initialized ? 
                        window.i18n.translate('checkout.selectPaymentMethod') : 
                        'Por favor, selecciona un método de pago',
                    'error'
                );
            } else if (selectedPaymentMethod.value === 'card') {
                // Validar campos de tarjeta si ese método está seleccionado
                const cardFields = [
                    'card-number', 'card-name', 'card-expiry', 'card-cvv'
                ];
                
                cardFields.forEach(fieldId => {
                    const field = document.getElementById(fieldId);
                    if (!field.value.trim()) {
                        field.classList.add('error');
                        isValid = false;
                    } else {
                        field.classList.remove('error');
                    }
                });
                
                if (!isValid) {
                    window.infinityUtils.showNotification(
                        window.i18n && window.i18n.initialized ? 
                            window.i18n.translate('checkout.completeCardInfo') : 
                            'Por favor, completa todos los campos de la tarjeta',
                        'error'
                    );
                }
            }
        }
        
        return isValid;
    }
    
    /**
     * Carga el listado de países en el selector
     */
    function loadCountries() {
        const countrySelect = document.getElementById('country');
        if (!countrySelect) return;
        
        // Lista de países (se podría cargar desde una API)
        const countries = [
            { code: 'US', name: 'United States' },
            { code: 'CA', name: 'Canada' },
            { code: 'MX', name: 'Mexico' },
            { code: 'ES', name: 'España' },
            { code: 'AR', name: 'Argentina' },
            { code: 'CL', name: 'Chile' },
            { code: 'CO', name: 'Colombia' },
            { code: 'PE', name: 'Perú' },
            { code: 'FR', name: 'France' },
            { code: 'DE', name: 'Germany' },
            { code: 'IT', name: 'Italy' },
            { code: 'UK', name: 'United Kingdom' },
            { code: 'BR', name: 'Brazil' },
            { code: 'CN', name: 'China' },
            { code: 'JP', name: 'Japan' },
            { code: 'AU', name: 'Australia' },
            { code: 'NZ', name: 'New Zealand' }
        ];
        
        // Ordenar países alfabéticamente según el idioma actual
        countries.sort((a, b) => {
            return a.name.localeCompare(b.name, window.i18n ? window.i18n.currentLanguage : 'en');
        });
        
        // Añadir opciones al selector
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country.code;
            option.textContent = country.name;
            countrySelect.appendChild(option);
        });
    }
    
    /**
     * Actualiza el resumen del pedido en el checkout
     */
    function updateCheckoutSummary() {
        const cart = window.shoppingCart;
        if (!cart) return;
        
        // Referencia a elementos del resumen
        const checkoutItemsContainer = document.getElementById('checkout-items');
        const subtotalElement = document.getElementById('checkout-subtotal');
        const discountRowElement = document.querySelector('.discount-row');
        const discountElement = document.getElementById('checkout-discount');
        const taxElement = document.getElementById('checkout-tax');
        const totalElement = document.getElementById('checkout-total');
        
        // Tasa de impuesto (podría obtenerse dinámicamente según la ubicación)
        const taxRate = 0; // 0% por defecto, ajustar según necesidad
        
        // Limpiar contenedor de items
        if (checkoutItemsContainer) {
            checkoutItemsContainer.innerHTML = '';
            
            // Añadir cada producto al resumen
            cart.items.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'checkout-item';
                
                itemElement.innerHTML = `
                    <div class="checkout-item-details">
                        <div class="checkout-item-name">${item.name}</div>
                        <div class="checkout-item-quantity">x${item.quantity}</div>
                    </div>
                    <div class="checkout-item-price">${window.infinityUtils.formatPrice(item.price * item.quantity)}</div>
                `;
                
                checkoutItemsContainer.appendChild(itemElement);
            });
        }
        
        // Actualizar importes
        const subtotal = cart.getSubtotal();
        const discount = cart.discountAmount;
        const tax = cart.getTax(taxRate);
        const total = cart.getTotal(taxRate);
        
        if (subtotalElement) subtotalElement.textContent = window.infinityUtils.formatPrice(subtotal);
        
        if (discountRowElement && discountElement) {
            if (discount > 0) {
                discountRowElement.style.display = 'flex';
                discountElement.textContent = '-' + window.infinityUtils.formatPrice(discount);
            } else {
                discountRowElement.style.display = 'none';
            }
        }
        
        if (taxElement) taxElement.textContent = window.infinityUtils.formatPrice(tax);
        if (totalElement) totalElement.textContent = window.infinityUtils.formatPrice(total);
    }
    
    /**
     * Actualiza el resumen de revisión antes de la confirmación
     */
    function updateReviewSummary() {
        // Datos de contacto
        const firstName = document.getElementById('first-name').value;
        const lastName = document.getElementById('last-name').value;
        const email = document.getElementById('email').value;
        
        const contactElement = document.getElementById('review-contact');
        if (contactElement) {
            contactElement.innerHTML = `
                <p><strong>${firstName} ${lastName}</strong></p>
                <p>${email}</p>
            `;
        }
        
        // Datos de facturación
        const countrySelect = document.getElementById('country');
        const address = document.getElementById('address').value;
        const city = document.getElementById('city').value;
        const zipCode = document.getElementById('zip-code').value;
        
        const countryName = countrySelect.options[countrySelect.selectedIndex].text;
        
        const billingElement = document.getElementById('review-billing');
        if (billingElement) {
            billingElement.innerHTML = `
                <p>${address}</p>
                <p>${city}, ${zipCode}</p>
                <p>${countryName}</p>
            `;
        }
        
        // Método de pago
        const selectedPayment = document.querySelector('input[name="payment-method"]:checked');
        
        const paymentElement = document.getElementById('review-payment');
        if (paymentElement && selectedPayment) {
            let paymentInfo = '';
            
            switch (selectedPayment.value) {
                case 'paypal':
                    paymentInfo = 'PayPal';
                    break;
                case 'card':
                    const cardNumber = document.getElementById('card-number').value;
                    const lastFour = cardNumber.slice(-4);
                    paymentInfo = window.i18n && window.i18n.initialized ? 
                        window.i18n.translate('checkout.cardEnding', {number: lastFour}) : 
                        `Tarjeta terminada en ${lastFour}`;
                    break;
                case 'crypto':
                    paymentInfo = window.i18n && window.i18n.initialized ? 
                        window.i18n.translate('checkout.cryptoPayment') : 
                        'Pago con criptomoneda';
                    break;
            }
            
            paymentElement.innerHTML = `<p>${paymentInfo}</p>`;
        }
        
        // Resumen de productos
        const cart = window.shoppingCart;
        const reviewItemsContainer = document.getElementById('review-items');
        
        if (reviewItemsContainer && cart) {
            reviewItemsContainer.innerHTML = '';
            
            cart.items.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'checkout-item';
                
                itemElement.innerHTML = `
                    <div class="checkout-item-details">
                        <div class="checkout-item-name">${item.name}</div>
                        <div class="checkout-item-quantity">x${item.quantity}</div>
                    </div>
                    <div class="checkout-item-price">${window.infinityUtils.formatPrice(item.price * item.quantity)}</div>
                `;
                
                reviewItemsContainer.appendChild(itemElement);
            });
        }
        
        // Actualizar importes
        const subtotal = cart.getSubtotal();
        const discount = cart.discountAmount;
        const taxRate = 0; // 0% por defecto, ajustar según necesidad
        const tax = cart.getTax(taxRate);
        const total = cart.getTotal(taxRate);
        
        const subtotalElement = document.getElementById('review-subtotal');
        const discountRowElement = document.querySelector('#review-items').nextElementSibling.querySelector('.discount-row');
        const discountElement = document.getElementById('review-discount');
        const taxElement = document.getElementById('review-tax');
        const totalElement = document.getElementById('review-total');
        
        if (subtotalElement) subtotalElement.textContent = window.infinityUtils.formatPrice(subtotal);
        
        if (discountRowElement && discountElement) {
            if (discount > 0) {
                discountRowElement.style.display = 'flex';
                discountElement.textContent = '-' + window.infinityUtils.formatPrice(discount);
            } else {
                discountRowElement.style.display = 'none';
            }
        }
        
        if (taxElement) taxElement.textContent = window.infinityUtils.formatPrice(tax);
        if (totalElement) totalElement.textContent = window.infinityUtils.formatPrice(total);
    }
    
    /**
     * Procesa la compra
     */
    function processPurchase() {
        // Verificar que se ha aceptado los términos y condiciones
        if (!termsCheckbox.checked) {
            window.infinityUtils.showNotification(
                window.i18n && window.i18n.initialized ? 
                    window.i18n.translate('checkout.acceptTerms') : 
                    'Debes aceptar los términos y condiciones para continuar',
                'error'
            );
            return;
        }
        
        // Mostrar pantalla de procesamiento
        goToStep(4);
        
        // Recopilar información del usuario
        const userInfo = {
            firstName: document.getElementById('first-name').value,
            lastName: document.getElementById('last-name').value,
            email: document.getElementById('email').value,
            country: document.getElementById('country').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            zipCode: document.getElementById('zip-code').value,
            paymentMethod: document.querySelector('input[name="payment-method"]:checked').value
        };
        
        // Procesar el pago mediante la función del carrito
        window.shoppingCart.processCheckout(userInfo)
            .then(orderData => {
                // Guardar datos del pedido en sessionStorage para la página de agradecimiento
                sessionStorage.setItem('order_data', JSON.stringify(orderData));
                
                // Redirigir a la página de agradecimiento
                window.location.href = '/pages/thankyou.html';
            })
            .catch(error => {
                // Volver al paso de revisión y mostrar error
                goToStep(3);
                
                window.infinityUtils.showNotification(
                    error.message || (window.i18n && window.i18n.initialized ? 
                        window.i18n.translate('checkout.paymentError') : 
                        'Error al procesar el pago. Por favor, inténtalo de nuevo.'),
                    'error'
                );
            });
    }
    
    // Configurar eventos de botones "Siguiente"
    nextButtons.forEach(button => {
        button.addEventListener('click', goToNextStep);
    });
    
    // Configurar eventos de botones "Anterior"
    prevButtons.forEach(button => {
        button.addEventListener('click', goToPreviousStep);
    });
    
    // Configurar eventos de botones "Editar"
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const step = parseInt(this.getAttribute('data-step'));
            goToStep(step);
        });
    });
    
    // Configurar selección de método de pago
    paymentMethods.forEach(method => {
        method.addEventListener('click', function() {
            // Seleccionar radio button
            const radio = this.querySelector('input[type="radio"]');
            radio.checked = true;
            
            // Actualizar clases activas
            paymentMethods.forEach(m => m.classList.remove('active'));
            this.classList.add('active');
            
            // Mostrar/ocultar formularios específicos
            const paymentType = this.getAttribute('data-payment');
            
            if (paymentType === 'card') {
                cardPaymentForm.style.display = 'block';
                cryptoPaymentInfo.style.display = 'none';
            } else if (paymentType === 'crypto') {
                cardPaymentForm.style.display = 'none';
                cryptoPaymentInfo.style.display = 'block';
            } else {
                cardPaymentForm.style.display = 'none';
                cryptoPaymentInfo.style.display = 'none';
            }
        });
    });
    
    // Configurar evento de confirmación de compra
    if (confirmPurchaseButton) {
        confirmPurchaseButton.addEventListener('click', processPurchase);
    }
}