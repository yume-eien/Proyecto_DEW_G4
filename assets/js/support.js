/**
 * Infinity Ascend Software - Funcionalidades del centro de soporte
 */

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar las preguntas frecuentes
    initFAQ();
    
    // Inicializar formulario de búsqueda
    initSearchForm();
    
    // Inicializar formulario de contacto
    initContactForm();
    
    // Manejar anclajes en la URL
    handleURLAnchors();
});

/**
 * Inicializa el comportamiento acordeón de las preguntas frecuentes
 */
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        if (question) {
            question.addEventListener('click', () => {
                // Verificar si ya está activo
                const isActive = item.classList.contains('active');
                
                // Cerrar todos los items si se hace click en otro
                if (!isActive) {
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item && otherItem.classList.contains('active')) {
                            otherItem.classList.remove('active');
                            const otherAnswer = otherItem.querySelector('.faq-answer');
                            if (otherAnswer) {
                                otherAnswer.style.maxHeight = '0';
                            }
                        }
                    });
                }
                
                // Alternar estado del item actual
                item.classList.toggle('active');
                
                // Animar la altura máxima
                if (answer) {
                    if (item.classList.contains('active')) {
                        answer.style.maxHeight = answer.scrollHeight + 'px';
                    } else {
                        answer.style.maxHeight = '0';
                    }
                }
            });
        }
    });
}

/**
 * Inicializa el formulario de búsqueda
 */
function initSearchForm() {
    const searchForm = document.getElementById('support-search-form');
    
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const query = document.getElementById('support-query').value.trim().toLowerCase();
            
            if (query) {
                // Buscar en las preguntas de FAQ
                searchFAQs(query);
            }
        });
    }
}

/**
 * Busca términos en las preguntas y respuestas de FAQ
 * @param {string} query - Términos de búsqueda
 */
function searchFAQs(query) {
    const faqItems = document.querySelectorAll('.faq-item');
    let matchFound = false;
    
    // Cerrar todas las preguntas primero
    faqItems.forEach(item => {
        item.classList.remove('active');
        item.classList.remove('highlight');
        const answer = item.querySelector('.faq-answer');
        if (answer) {
            answer.style.maxHeight = '0';
        }
    });
    
    // Buscar y abrir las que coincidan
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question span').textContent.toLowerCase();
        const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
        
        if (question.includes(query) || answer.includes(query)) {
            item.classList.add('active');
            item.classList.add('highlight');
            
            const answerElement = item.querySelector('.faq-answer');
            if (answerElement) {
                answerElement.style.maxHeight = answerElement.scrollHeight + 'px';
            }
            
            matchFound = true;
            
            // Hacer scroll al primer resultado
            if (matchFound) {
                item.scrollIntoView({ behavior: 'smooth', block: 'center' });
                matchFound = false; // Solo hacemos scroll al primero
            }
        }
    });
    
    // Mostrar mensaje si no hay resultados
    if (!matchFound) {
        window.infinityUtils.showNotification(
            window.i18n && window.i18n.initialized ? 
                window.i18n.translate('support.noResultsFound') : 
                'No se encontraron resultados para tu búsqueda',
            'info'
        );
    }
}

/**
 * Inicializa el formulario de contacto
 */
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validar formulario
            if (validateContactForm()) {
                // Simulamos el envío (en un entorno real, esto sería una API)
                submitContactForm();
            }
        });
    }
}

/**
 * Valida los campos del formulario de contacto
 * @returns {boolean} - true si el formulario es válido
 */
function validateContactForm() {
    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const subject = document.getElementById('contact-subject').value;
    const message = document.getElementById('contact-message').value.trim();
    const privacy = document.getElementById('contact-privacy').checked;
    
    // Validar que los campos requeridos estén completos
    if (!name || !email || !subject || !message || !privacy) {
        window.infinityUtils.showNotification(
            window.i18n && window.i18n.initialized ? 
                window.i18n.translate('support.requiredFields') : 
                'Por favor, completa todos los campos requeridos',
            'error'
        );
        return false;
    }
    
    // Validar formato de email
    if (!window.infinityUtils.isValidEmail(email)) {
        window.infinityUtils.showNotification(
            window.i18n && window.i18n.initialized ? 
                window.i18n.translate('support.invalidEmail') : 
                'Por favor, introduce un email válido',
            'error'
        );
        return false;
    }
    
    return true;
}

/**
 * Simula el envío del formulario de contacto
 */
function submitContactForm() {
    // Mostrar indicador de carga
    const submitButton = document.querySelector('#contact-form button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<svg class="spinner" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg> Enviando...';
    
    // Simular tiempo de procesamiento
    setTimeout(() => {
        // Resetear formulario
        document.getElementById('contact-form').reset();
        
        // Restaurar botón
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
        
        // Mostrar mensaje de éxito
        window.infinityUtils.showNotification(
            window.i18n && window.i18n.initialized ? 
                window.i18n.translate('support.messageSent') : 
                'Tu mensaje ha sido enviado. Te responderemos lo antes posible.',
            'success'
        );
    }, 1500);
}

/**
 * Maneja los anclajes en la URL para abrir la pregunta correspondiente
 */
function handleURLAnchors() {
    // Verificar si hay un ancla en la URL
    const hash = window.location.hash;
    
    if (hash && hash.startsWith('#')) {
        // Si es un ancla de categoría, expandir la primera pregunta
        const categoryId = hash.substring(1);
        const category = document.getElementById(categoryId);
        
        if (category) {
            // Hacer scroll a la categoría
            setTimeout(() => {
                category.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                // Expandir la primera pregunta de la categoría
                const firstQuestion = category.querySelector('.faq-item');
                if (firstQuestion) {
                    const questionBtn = firstQuestion.querySelector('.faq-question');
                    if (questionBtn) {
                        questionBtn.click();
                    }
                }
            }, 300);
        }
    }
}