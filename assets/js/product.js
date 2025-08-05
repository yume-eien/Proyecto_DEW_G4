/**
 * Infinity Ascend Software - Funcionalidades específicas para páginas de productos
 */

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar la funcionalidad de FAQ
    initFaq();
    
    // Inicializar efectos de scroll para elementos
    initProductScrollEffects();
    
    // Configurar el video de demostración
    setupVideoDemo();
});

/**
 * Inicializa el comportamiento de acordeón para las preguntas frecuentes
 */
function initFaq() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        if (question) {
            question.addEventListener('click', () => {
                // Cerrar todos los items primero
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Abrir/cerrar el item actual
                item.classList.toggle('active');
            });
        }
    });
}

/**
 * Inicializa efectos de scroll para elementos en la página de producto
 */
function initProductScrollEffects() {
    // Función para verificar si un elemento está en el viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.9 &&
            rect.bottom >= 0
        );
    }
    
    // Elementos que queremos animar al hacer scroll
    const animatedElements = document.querySelectorAll('.feature-card, .testimonial-card, .requirement-group');
    
    // Añadir clase inicial para elementos fuera de la pantalla
    animatedElements.forEach(element => {
        if (!isInViewport(element)) {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        }
    });
    
    // Función para manejar el scroll
    function handleScroll() {
        animatedElements.forEach(element => {
            if (isInViewport(element) && element.style.opacity === '0') {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    }
    
    // Ejecutar una vez al inicio para elementos ya visibles
    handleScroll();
    
    // Escuchar el evento de scroll
    window.addEventListener('scroll', handleScroll);
}

/**
 * Configuración del video de demostración
 */
function setupVideoDemo() {
    const videoContainer = document.querySelector('.video-container');
    const video = videoContainer ? videoContainer.querySelector('video') : null;
    
    if (video) {
        // Opcional: reproducir video automáticamente cuando esté en el viewport
        let videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // Reproducir o pausar según visibilidad
                if (entry.isIntersecting) {
                    // Usar Promise para manejar posibles errores
                    const playPromise = video.play();
                    
                    if (playPromise !== undefined) {
                        playPromise.catch(error => {
                            console.warn('Video playback was prevented:', error);
                            
                            // En dispositivos móviles, muchos navegadores requieren interacción del usuario
                            // No hacer nada aquí, el usuario tendrá que hacer clic en el video
                        });
                    }
                } else {
                    video.pause();
                }
            });
        }, { threshold: 0.5 });
        
        videoObserver.observe(video);
        
        // Añadir controles de reproducción personalizados si se desea
        // Este es un ejemplo simplificado, puedes expandirlo según tus necesidades
        videoContainer.addEventListener('click', () => {
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        });
    }
}

/**
 * Función para añadir al carrito desde la página de producto
 * Esta es una versión simplificada que utiliza el sistema de carrito global
 */
function addToCartFromProductPage() {
    // Obtener el ID del producto desde la URL o un atributo de datos
    const productPath = window.location.pathname;
    let productId = '';
    
    if (productPath.includes('/autoflow/')) {
        productId = 'autoflow';
    } else if (productPath.includes('/bulletproof/')) {
        productId = 'bulletproof';
    }
    
    if (productId && window.shoppingCart) {
        window.shoppingCart.addItem(window.shoppingCart.getProductInfo(productId));
        
        // Mostrar notificación
        if (window.infinityUtils) {
            const productName = productId === 'autoflow' ? 'Autoflow' : 'BulletProof';
            const message = window.i18n && window.i18n.initialized ? 
                window.i18n.translate('cart.productAdded', {product: productName}) : 
                `${productName} added to cart`;
            
            window.infinityUtils.showNotification(message, 'success');
        }
    }
}

/**
 * Obtiene información detallada del producto actual
 * Útil para integraciones con API y análisis
 */
function getDetailedProductInfo() {
    const productPath = window.location.pathname;
    let productInfo = {
        id: '',
        name: '',
        price: 0,
        category: 'software',
        viewed: true
    };
    
    if (productPath.includes('/autoflow/')) {
        productInfo.id = 'autoflow';
        productInfo.name = 'Autoflow';
        productInfo.price = 49.99;
        productInfo.features = ['macros ilimitadas', 'programación avanzada', 'modos diurno/nocturno'];
    } else if (productPath.includes('/bulletproof/')) {
        productInfo.id = 'bulletproof';
        productInfo.name = 'BulletProof';
        productInfo.price = 39.99;
        productInfo.features = ['300 bits de seguridad', 'encriptación avanzada', 'interfaz intuitiva'];
    }
    
    return productInfo;
}

// Exportar funciones para uso global si es necesario
window.productFunctions = {
    addToCartFromProductPage,
    getDetailedProductInfo
};