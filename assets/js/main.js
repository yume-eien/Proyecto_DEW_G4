/**
 * Infinity Ascend Software - Archivo JavaScript Principal
 * Contiene funcionalidades comunes para todo el sitio.
 */

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar la navegación móvil
    initMobileNav();
    
    // Establecer el año actual en el footer
    setCurrentYear();
    
    // Inicializar los efectos de scroll
    initScrollEffects();
    
    // Detectar el modo oscuro del sistema
    checkDarkMode();
});

/**
 * Inicializa la navegación móvil (hamburguesa)
 */
function initMobileNav() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const body = document.body;
    
    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            body.classList.toggle('mobile-menu-open');
        });
        
        // Cerrar menú al hacer clic en un enlace
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    mainNav.classList.remove('active');
                    body.classList.remove('mobile-menu-open');
                }
            });
        });
    }
}

/**
 * Establece el año actual en el footer
 */
function setCurrentYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

/**
 * Inicializa efectos de scroll para elementos que aparecen al hacer scroll
 */
function initScrollEffects() {
    // Función para verificar si un elemento está en el viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.9 &&
            rect.bottom >= 0
        );
    }
    
    // Elementos que queremos animar al hacer scroll
    const animatedElements = document.querySelectorAll('.feature-card, .product-card, .testimonial-card');
    
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
 * Detecta si el sistema está en modo oscuro y ajusta algunas variables CSS
 */
function checkDarkMode() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // El usuario tiene activado el modo oscuro en su sistema
        document.documentElement.setAttribute('data-theme', 'dark');
        
        // Esto solo es un flag - los estilos dark se implementarían completamente en CSS
    }
    
    // Escuchar cambios en la preferencia del sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        document.documentElement.setAttribute('data-theme', event.matches ? 'dark' : 'light');
    });
}

/**
 * Formatea un precio con el símbolo de moneda
 * @param {number} price - Precio a formatear
 * @returns {string} - Precio formateado
 */
function formatPrice(price) {
    // Si tenemos i18n disponible, usarlo
    if (window.i18n && window.i18n.initialized) {
        return window.i18n.formatPrice(price);
    }
    
    // Formato de respaldo si i18n no está disponible
    return '$' + price.toFixed(2);
}

/**
 * Muestra un mensaje de notificación al usuario
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de mensaje (success, error, warning, info)
 * @param {number} duration - Duración en milisegundos
 */
function showNotification(message, type = 'info', duration = 3000) {
    // Crear el elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Añadir al DOM
    document.body.appendChild(notification);
    
    // Mostrar con animación
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Ocultar después de la duración especificada
    setTimeout(() => {
        notification.classList.remove('show');
        notification.addEventListener('transitionend', function() {
            notification.remove();
        });
    }, duration);
}

/**
 * Función para cargar contenido de forma asíncrona
 * @param {string} url - URL a cargar
 * @param {string} targetSelector - Selector del elemento donde insertar el contenido
 * @returns {Promise} - Promesa que se resuelve cuando el contenido se carga
 */
async function loadContent(url, targetSelector) {
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        const target = document.querySelector(targetSelector);
        
        if (target) {
            target.innerHTML = html;
            
            // Volver a traducir el contenido nuevo
            if (window.i18n && window.i18n.initialized) {
                window.i18n.translatePage();
            }
            
            // Ejecutar scripts en el contenido cargado
            const scripts = target.querySelectorAll('script');
            scripts.forEach(script => {
                const newScript = document.createElement('script');
                
                Array.from(script.attributes).forEach(attr => {
                    newScript.setAttribute(attr.name, attr.value);
                });
                
                newScript.textContent = script.textContent;
                script.parentNode.replaceChild(newScript, script);
            });
            
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Error loading content:', error);
        return false;
    }
}

/**
 * Valida si un email tiene formato correcto
 * @param {string} email - Email a validar
 * @returns {boolean} - true si es válido, false si no
 */
function isValidEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

/**
 * Funciones exportadas para uso en otros archivos
 */
window.infinityUtils = {
    formatPrice,
    showNotification,
    loadContent,
    isValidEmail
};