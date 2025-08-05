/**
 * Enhanced Video Carousel Component - Optimizado para 3 slides
 * Solución profesional sin conflictos con el sistema de carrito existente
 */

class EnhancedVideoCarousel {
    constructor(containerSelector = '.hero-carousel') {
        this.container = document.querySelector(containerSelector);
        
        if (!this.container) {
            console.warn('Carousel container not found:', containerSelector);
            return;
        }

        // Elementos del DOM
        this.slides = this.container.querySelectorAll('.carousel-slide');
        this.indicators = this.container.querySelectorAll('.indicator');
        this.prevBtn = this.container.querySelector('.prev-slide');
        this.nextBtn = this.container.querySelector('.next-slide');
        this.iframes = this.container.querySelectorAll('.video-container iframe');
        
        // Estado del carrusel
        this.currentIndex = 0;
        this.totalSlides = this.slides.length;
        this.isTransitioning = false;
        this.autoPlayInterval = null;
        this.autoPlayDelay = 7000; // 7 segundos para 3 slides
        this.isUserInteracting = false;
        this.progressInterval = null;
        
        // Configuración de touch/swipe
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.minSwipeDistance = 50;
        
        // Datos de productos (solo para referencia interna del carrusel)
        this.productData = {
            'autoflow': {
                name: 'Autoflow',
                price: '$99.99',
                description: 'Automatización masiva inteligente'
            },
            'bulletproof': {
                name: 'BulletProof', 
                price: '$19.99',
                description: 'Seguridad de contraseñas militar'
            },
            'securevault': {
                name: 'SecureVault',
                price: '$59.99', 
                description: 'Almacenamiento ultra-seguro'
            },
            'bluebeam': {
                name: 'Bluebeam',
                price: '$60.99',
                description: 'Gestión documental y colaboración'
            }
        };
        
        this.init();
    }

    /**
     * Inicializa el carrusel y configura todos los event listeners
     */
    init() {
        console.log(`🎠 Inicializando Enhanced Video Carousel con ${this.totalSlides} slides...`);
        
        this.setupEventListeners();
        this.setupTouchControls();
        this.setupKeyboardControls();
        this.setupVisibilityControl();
        this.setupIntersectionObserver();
        this.setupProgressIndicator();
        this.setupCartButtonEffects(); // Solo efectos visuales, sin lógica de carrito
        
        // Configurar estado inicial
        this.updateSlide(0, false);
        this.startAutoPlay();
        
        console.log('✅ Carousel inicializado correctamente');
    }

    /**
     * Configura los event listeners para navegación
     */
    setupEventListeners() {
        // Botones de navegación
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.goToPrevious();
                this.trackEvent('navigation', 'button_previous');
            });
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.goToNext();
                this.trackEvent('navigation', 'button_next');
            });
        }
        
        // Indicadores
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.goToSlide(index);
                this.trackEvent('navigation', 'indicator_click', index);
            });
        });

        // Pausar autoplay en interacción del usuario
        this.container.addEventListener('mouseenter', () => {
            this.isUserInteracting = true;
            this.stopAutoPlay();
        });
        
        this.container.addEventListener('mouseleave', () => {
            this.isUserInteracting = false;
            if (!document.hidden) {
                this.startAutoPlay();
            }
        });

        // Controlar autoplay con focus en botones
        const interactiveElements = this.container.querySelectorAll('button, a, iframe');
        interactiveElements.forEach(element => {
            element.addEventListener('focus', () => this.stopAutoPlay());
            element.addEventListener('blur', () => {
                if (!this.isUserInteracting && !document.hidden) {
                    this.startAutoPlay();
                }
            });
        });
    }

    /**
     * Configura controles táctiles para dispositivos móviles
     */
    setupTouchControls() {
        this.container.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
            this.stopAutoPlay();
        }, { passive: true });
        
        this.container.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
            
            if (!this.isUserInteracting && !document.hidden) {
                setTimeout(() => this.startAutoPlay(), 1000);
            }
        }, { passive: true });

        // Prevenir scroll vertical durante swipe horizontal
        this.container.addEventListener('touchmove', (e) => {
            if (Math.abs(this.touchStartX - e.changedTouches[0].screenX) > 10) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    /**
     * Configura controles de teclado para accesibilidad
     */
    setupKeyboardControls() {
        this.container.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.goToPrevious();
                    this.trackEvent('navigation', 'keyboard_left');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.goToNext();
                    this.trackEvent('navigation', 'keyboard_right');
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToSlide(0);
                    this.trackEvent('navigation', 'keyboard_home');
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToSlide(this.totalSlides - 1);
                    this.trackEvent('navigation', 'keyboard_end');
                    break;
                case 'Space':
                    e.preventDefault();
                    this.toggleAutoPlay();
                    this.trackEvent('navigation', 'keyboard_space');
                    break;
            }
        });
    }

    /**
     * Controla el autoplay basado en la visibilidad de la página
     */
    setupVisibilityControl() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAutoPlay();
            } else if (!this.isUserInteracting) {
                setTimeout(() => this.startAutoPlay(), 500);
            }
        });
    }

    /**
     * Configura Intersection Observer para optimizar rendimiento
     */
    setupIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        if (!this.isUserInteracting && !document.hidden) {
                            this.startAutoPlay();
                        }
                    } else {
                        this.stopAutoPlay();
                    }
                });
            }, { threshold: 0.5 });

            observer.observe(this.container);
        }
    }

    /**
     * Configura un indicador de progreso visual para el autoplay
     */
    setupProgressIndicator() {
        // Crear barra de progreso
        const progressBar = document.createElement('div');
        progressBar.className = 'carousel-progress';
        this.container.appendChild(progressBar);
        this.progressBar = progressBar;
    }

    /**
     * Configura efectos visuales para botones de carrito (SIN lógica de carrito)
     * La lógica real del carrito se maneja en cart.js
     */
    setupCartButtonEffects() {
        // Solo configurar efectos visuales para botones DENTRO del carrusel
        const carouselCartButtons = this.container.querySelectorAll('.add-to-cart');
        
        carouselCartButtons.forEach(btn => {
            // Remover event listeners previos si existen
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            // Solo agregar efecto visual de feedback
            newBtn.addEventListener('click', (e) => {
                const product = e.target.getAttribute('data-product');
                const productInfo = this.productData[product];
                
                if (!productInfo) return;
                
                // Solo efecto visual - NO manejo de carrito
                this.showCartButtonFeedback(e.target, productInfo);
                
                // Tracking del evento
                this.trackEvent('ecommerce', 'add_to_cart_attempt', product);
                
                console.log(`🎯 Carousel: Efecto visual para ${productInfo.name} - El carrito se maneja en cart.js`);
            });
        });
    }

    /**
     * Muestra feedback visual cuando se hace clic en agregar al carrito
     */
    showCartButtonFeedback(button, productInfo) {
        const originalText = button.textContent;
        const originalBg = button.style.background;
        const originalTransform = button.style.transform;
        
        // Efecto visual temporal
        button.textContent = `✅ ${productInfo.name}`;
        button.style.background = 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
        button.style.transform = 'scale(1.05)';
        button.disabled = true;
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = originalBg;
            button.style.transform = originalTransform;
            button.disabled = false;
        }, 2000);
    }

    /**
     * Actualiza la barra de progreso del autoplay
     */
    updateProgress() {
        if (!this.progressBar || !this.autoPlayInterval) return;
        
        let progress = 0;
        const interval = 50; // Actualizar cada 50ms
        const increment = (interval / this.autoPlayDelay) * 100;
        
        this.progressInterval = setInterval(() => {
            progress += increment;
            this.progressBar.style.width = `${Math.min(progress, 100)}%`;
            
            if (progress >= 100) {
                clearInterval(this.progressInterval);
                this.progressBar.style.width = '0%';
            }
        }, interval);
    }

    /**
     * Maneja los gestos de swipe
     */
    handleSwipe() {
        const swipeDistance = this.touchStartX - this.touchEndX;
        
        if (Math.abs(swipeDistance) > this.minSwipeDistance) {
            if (swipeDistance > 0) {
                // Swipe izquierda -> siguiente
                this.goToNext();
                this.trackEvent('navigation', 'swipe_left');
            } else {
                // Swipe derecha -> anterior
                this.goToPrevious();
                this.trackEvent('navigation', 'swipe_right');
            }
        }
    }

    /**
     * Navega al slide especificado
     */
    goToSlide(index, triggerAutoPlay = true) {
        if (this.isTransitioning || index === this.currentIndex || index < 0 || index >= this.totalSlides) {
            return;
        }
        
        console.log(`🎯 Navegando al slide ${index} (${this.getProductName(index)})`);
        
        const prevIndex = this.currentIndex;
        this.currentIndex = index;
        
        this.updateSlide(prevIndex, true);
        
        if (triggerAutoPlay && !this.isUserInteracting) {
            this.restartAutoPlay();
        }

        // Disparar evento personalizado
        this.dispatchSlideChangeEvent(index, prevIndex);
    }

    /**
     * Navega al siguiente slide
     */
    goToNext() {
        const nextIndex = (this.currentIndex + 1) % this.totalSlides;
        this.goToSlide(nextIndex, false);
    }

    /**
     * Navega al slide anterior
     */
    goToPrevious() {
        const prevIndex = this.currentIndex === 0 ? this.totalSlides - 1 : this.currentIndex - 1;
        this.goToSlide(prevIndex, false);
    }

    /**
     * Actualiza el slide activo con animaciones
     */
    updateSlide(prevIndex, animate = true) {
        if (!animate) {
            this.setActiveSlide();
            return;
        }

        this.isTransitioning = true;
        
        // Remover clases activas del slide anterior
        if (this.slides[prevIndex]) {
            this.slides[prevIndex].classList.remove('active');
            this.slides[prevIndex].classList.add('prev');
        }
        
        if (this.indicators[prevIndex]) {
            this.indicators[prevIndex].classList.remove('active');
        }
        
        // Aplicar nueva configuración con un pequeño delay para suavizar
        requestAnimationFrame(() => {
            this.setActiveSlide();
            
            // Limpiar clases de transición después de la animación
            setTimeout(() => {
                if (this.slides[prevIndex]) {
                    this.slides[prevIndex].classList.remove('prev');
                }
                this.isTransitioning = false;
            }, 700); // Coincide con la duración de la transición CSS
        });
    }

    /**
     * Establece el slide activo
     */
    setActiveSlide() {
        // Activar slide actual
        if (this.slides[this.currentIndex]) {
            this.slides[this.currentIndex].classList.add('active');
        }
        
        // Activar indicador actual
        if (this.indicators[this.currentIndex]) {
            this.indicators[this.currentIndex].classList.add('active');
        }
        
        // Actualizar atributos de accesibilidad
        this.updateAriaAttributes();
        
        console.log(`✨ Slide ${this.currentIndex} (${this.getProductName(this.currentIndex)}) activado`);
    }

    /**
     * Actualiza atributos ARIA para accesibilidad
     */
    updateAriaAttributes() {
        this.slides.forEach((slide, index) => {
            slide.setAttribute('aria-hidden', index !== this.currentIndex);
            slide.setAttribute('aria-label', `Slide ${index + 1} de ${this.totalSlides}: ${this.getProductName(index)}`);
        });
        
        this.indicators.forEach((indicator, index) => {
            indicator.setAttribute('aria-pressed', index === this.currentIndex);
        });
    }

    /**
     * Obtiene el nombre del producto del slide especificado
     */
    getProductName(index) {
        const slide = this.slides[index];
        if (!slide) return 'Unknown';
        
        const productId = slide.getAttribute('data-product');
        return this.productData[productId]?.name || 'Unknown Product';
    }

    /**
     * Inicia el autoplay
     */
    startAutoPlay() {
        if (this.autoPlayInterval) return;
        
        this.autoPlayInterval = setInterval(() => {
            if (!this.isUserInteracting && !document.hidden && !this.isTransitioning) {
                this.goToNext();
            }
        }, this.autoPlayDelay);
        
        this.updateProgress();
        console.log(`▶️ Autoplay iniciado (${this.autoPlayDelay}ms interval)`);
    }

    /**
     * Detiene el autoplay
     */
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
            console.log('⏸️ Autoplay detenido');
        }
        
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
        
        if (this.progressBar) {
            this.progressBar.style.width = '0%';
        }
    }

    /**
     * Alterna el autoplay
     */
    toggleAutoPlay() {
        if (this.autoPlayInterval) {
            this.stopAutoPlay();
        } else {
            this.startAutoPlay();
        }
    }

    /**
     * Reinicia el autoplay
     */
    restartAutoPlay() {
        this.stopAutoPlay();
        setTimeout(() => {
            if (!this.isUserInteracting && !document.hidden) {
                this.startAutoPlay();
            }
        }, 1000);
    }

    /**
     * Configura la velocidad del autoplay
     */
    setAutoPlaySpeed(speed) {
        this.autoPlayDelay = Math.max(2000, speed); // Mínimo 2 segundos
        this.restartAutoPlay();
        console.log(`⚡ Velocidad de autoplay actualizada: ${this.autoPlayDelay}ms`);
    }

    /**
     * Dispara un evento personalizado cuando cambia el slide
     */
    dispatchSlideChangeEvent(newIndex, prevIndex) {
        const event = new CustomEvent('carouselSlideChanged', {
            detail: {
                currentIndex: newIndex,
                previousIndex: prevIndex,
                currentProduct: this.slides[newIndex]?.getAttribute('data-product'),
                previousProduct: this.slides[prevIndex]?.getAttribute('data-product'),
                totalSlides: this.totalSlides
            }
        });
        
        document.dispatchEvent(event);
    }

    /**
     * Tracking de eventos para analytics
     */
    trackEvent(category, action, label = null) {
        // Integración con Google Analytics o sistema de tracking
        if (typeof gtag === 'function') {
            gtag('event', action, {
                event_category: category,
                event_label: label,
                custom_parameter: this.getProductName(this.currentIndex)
            });
        }
        
        console.log(`📊 Event tracked: ${category}.${action}${label !== null ? `.${label}` : ''}`);
    }

    /**
     * Destruye el carrusel y limpia event listeners
     */
    destroy() {
        this.stopAutoPlay();
        
        // Limpiar eventos
        if (this.container) {
            this.container.removeEventListener('touchstart', this.handleTouchStart);
            this.container.removeEventListener('touchend', this.handleTouchEnd);
        }
        
        console.log('🗑️ Carousel destruido');
    }

    /**
     * Obtiene información del estado actual
     */
    getState() {
        return {
            currentIndex: this.currentIndex,
            currentProduct: this.slides[this.currentIndex]?.getAttribute('data-product'),
            totalSlides: this.totalSlides,
            isAutoPlaying: !!this.autoPlayInterval,
            isTransitioning: this.isTransitioning,
            isUserInteracting: this.isUserInteracting,
            autoPlaySpeed: this.autoPlayDelay
        };
    }

    /**
     * API pública para control externo
     */
    getPublicAPI() {
        return {
            goToSlide: (index) => this.goToSlide(index),
            goToNext: () => this.goToNext(),
            goToPrevious: () => this.goToPrevious(),
            setSpeed: (speed) => this.setAutoPlaySpeed(speed),
            pause: () => this.stopAutoPlay(),
            play: () => this.startAutoPlay(),
            getState: () => this.getState()
        };
    }
}

// Inicialización automática cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const carouselContainer = document.querySelector('.hero-carousel');
    
    if (carouselContainer) {
        const carousel = new EnhancedVideoCarousel();
        
        // Exponer API pública globalmente
        window.videoCarousel = carousel.getPublicAPI();
        window.videoCarouselInstance = carousel; // Para debugging
        
        // Event listeners personalizados para comunicación con otros componentes
        document.addEventListener('carouselControl', (e) => {
            const { action, data } = e.detail;
            
            switch(action) {
                case 'goToSlide':
                    carousel.goToSlide(data.index);
                    break;
                case 'setSpeed':
                    carousel.setAutoPlaySpeed(data.speed);
                    break;
                case 'pause':
                    carousel.stopAutoPlay();
                    break;
                case 'play':
                    carousel.startAutoPlay();
                    break;
            }
        });
        
    } else {
        console.warn('⚠️ No se encontró el contenedor del carousel (.hero-carousel)');
    }
});

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedVideoCarousel;
}