/**
 * Infinity Ascend Software - Funcionalidades para páginas legales
 */

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar la navegación en la tabla de contenidos
    initTableOfContents();
    
    // Manejar anclajes en la URL
    handleURLAnchors();
    
    // Actualizar anclajes cuando se hace scroll
    if (window.innerWidth >= 992) { // Solo en pantallas grandes
        initScrollSpy();
    }
});

/**
 * Inicializa la tabla de contenidos para navegación suave
 */
function initTableOfContents() {
    const tocLinks = document.querySelectorAll('.toc-list a');
    
    tocLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // Hacer scroll suave a la sección
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
                
                // Actualizar URL sin recargar la página
                history.pushState(null, null, `#${targetId}`);
            }
        });
    });
}

/**
 * Maneja los anclajes en la URL para hacer scroll a la sección correspondiente
 */
function handleURLAnchors() {
    // Verificar si hay un ancla en la URL
    const hash = window.location.hash;
    
    if (hash && hash.startsWith('#')) {
        // Hacer scroll a la sección correspondiente
        const targetId = hash.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            // Pequeño retraso para asegurar que la página esté completamente cargada
            setTimeout(() => {
                targetElement.scrollIntoView();
            }, 300);
        }
    }
}

/**
 * Inicializa el "scroll spy" para resaltar los enlaces de la tabla de contenidos
 * según la sección visible
 */
function initScrollSpy() {
    const sections = document.querySelectorAll('.legal-document section');
    const tocLinks = document.querySelectorAll('.toc-list a');
    
    // Función para determinar qué sección está en la vista
    function highlightActiveTocItem() {
        // Obtener la posición actual del scroll
        const scrollPosition = window.scrollY + window.innerHeight / 3;
        
        // Encontrar la sección actualmente visible
        let activeSection = null;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                activeSection = section.getAttribute('id');
            }
        });
        
        // Actualizar el estado activo de los enlaces de la tabla de contenidos
        if (activeSection) {
            tocLinks.forEach(link => {
                const href = link.getAttribute('href').substring(1);
                
                if (href === activeSection) {
                    link.classList.add('active');
                    link.style.fontWeight = '600';
                    link.style.color = 'var(--primary-500)';
                } else {
                    link.classList.remove('active');
                    link.style.fontWeight = 'normal';
                    link.style.color = '';
                }
            });
        }
    }
    
    // Inicializar al cargar
    highlightActiveTocItem();
    
    // Actualizar al hacer scroll
    window.addEventListener('scroll', highlightActiveTocItem);
}

/**
 * Maneja la impresión de documentos legales
 */
document.getElementById('print-document')?.addEventListener('click', function() {
    window.print();
});