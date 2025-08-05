/**
 * Infinity Ascend Software - Funcionalidades del catálogo de productos
 */

document.addEventListener('DOMContentLoaded', function() {
    // Obtener referencias a elementos DOM
    const productsContainer = document.getElementById('products-container');
    const categoryFilter = document.getElementById('category-filter');
    const sortByFilter = document.getElementById('sort-by');
    const productSearch = document.getElementById('product-search');
    const searchBtn = document.getElementById('search-btn');
    const noResults = document.getElementById('no-results');
    const resetFiltersBtn = document.getElementById('reset-filters');
    const notifyButtons = document.querySelectorAll('.notify-btn');
    const newsletterForm = document.getElementById('newsletter-form');
    
    // Productos del catálogo (en un sistema real vendrían de una API)
    const products = [
        {
            id: 'autoflow',
            name: 'Autoflow',
            category: 'automation',
            price: 49.99,
            description: 'Software de automatización masiva que te permite definir acciones, velocidad y frecuencia de manera intuitiva.',
            version: '1.2.4',
            featured: true,
            image: '/assets/img/imagenes/auto.png',
            features: [
                'Macros Ilimitadas',
                'Programación Avanzada',
                'Multiplataforma'
            ]
        },
        {
            id: 'bulletproof',
            name: 'BulletProof',
            category: 'security',
            price: 39.99,
            description: 'Gestor y generador de contraseñas con mínimo 300 bits de seguridad, imposibles de hackear.',
            version: '1.1.2',
            featured: false,
            image: '/assets/img/imagenes/bule.png',
            features: [
                '300+ bits de seguridad',
                'Almacenamiento cifrado',
                'Generador avanzado'
            ]
        },
        {
            id: 'bluebeam',
            name: 'Bluebeam',
            category: 'security',
            price: 39.99,
            description: 'Gestor y generador de contraseñas con mínimo 300 bits de seguridad, imposibles de hackear.',
            version: '2.3.1',
            featured: false,
            image: '/assets/img/imagenes/blu.png',
            features: [
                '300+ bits de seguridad',
                'Almacenamiento cifrado',
                'Generador avanzado'
            ]
        }
    ];
    
    // Estado actual de los filtros
    let currentFilters = {
        category: 'all',
        search: '',
        sort: 'featured'
    };
    
    /**
     * Inicializa los filtros y eventos
     */
    function initCatalog() {
        // Configurar eventos de filtros
        if (categoryFilter) {
            categoryFilter.addEventListener('change', function() {
                currentFilters.category = this.value;
                applyFilters();
            });
        }
        
        if (sortByFilter) {
            sortByFilter.addEventListener('change', function() {
                currentFilters.sort = this.value;
                applyFilters();
            });
        }
        
        if (productSearch && searchBtn) {
            // Búsqueda al hacer clic en el botón
            searchBtn.addEventListener('click', function() {
                currentFilters.search = productSearch.value.trim().toLowerCase();
                applyFilters();
            });
            
            // Búsqueda al presionar Enter
            productSearch.addEventListener('keyup', function(e) {
                if (e.key === 'Enter') {
                    currentFilters.search = this.value.trim().toLowerCase();
                    applyFilters();
                }
            });
        }
        
        // Restablecer filtros
        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', function() {
                // Restablecer valores en los controles
                if (categoryFilter) categoryFilter.value = 'all';
                if (sortByFilter) sortByFilter.value = 'featured';
                if (productSearch) productSearch.value = '';
                
                // Restablecer estado de filtros
                currentFilters = {
                    category: 'all',
                    search: '',
                    sort: 'featured'
                };
                
                // Aplicar filtros
                applyFilters();
            });
        }
        
        // Configurar botones de notificación
        notifyButtons.forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-product');
                showNotifyModal(productId);
            });
        });
        
        // Configurar formulario de newsletter
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const emailInput = document.getElementById('newsletter-email');
                
                if (emailInput && emailInput.value.trim()) {
                    // En un entorno real, esto enviaría el email a una API
                    // Aquí simulamos un éxito
                    emailInput.value = '';
                    
                    window.infinityUtils.showNotification(
                        window.i18n && window.i18n.initialized ? 
                            window.i18n.translate('catalog.newsletterSuccess') : 
                            '¡Te has suscrito correctamente!',
                        'success'
                    );
                }
            });
        }
        
        // Aplicar filtros iniciales
        applyFilters();
    }
    
    /**
     * Aplica los filtros actuales a los productos
     */
    function applyFilters() {
        if (!productsContainer) return;
        
        // Filtrar productos
        let filteredProducts = [...products];
        
        // Filtrar por categoría
        if (currentFilters.category !== 'all') {
            filteredProducts = filteredProducts.filter(product => 
                product.category === currentFilters.category
            );
        }
        
        // Filtrar por búsqueda
        if (currentFilters.search) {
            filteredProducts = filteredProducts.filter(product => 
                product.name.toLowerCase().includes(currentFilters.search) || 
                product.description.toLowerCase().includes(currentFilters.search) ||
                product.features.some(feature => feature.toLowerCase().includes(currentFilters.search))
            );
        }
        
        // Ordenar productos
        switch (currentFilters.sort) {
            case 'price-asc':
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'name-asc':
                filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'featured':
            default:
                // Primero los destacados, luego el resto
                filteredProducts.sort((a, b) => {
                    if (a.featured && !b.featured) return -1;
                    if (!a.featured && b.featured) return 1;
                    return 0;
                });
                break;
        }
        
        // Mostrar productos filtrados
        renderProducts(filteredProducts);
    }
    
    /**
     * Renderiza la lista de productos filtrados
     * @param {Array} filteredProducts - Productos filtrados
     */
    function renderProducts(filteredProducts) {
        // Limpiar contenedor
        productsContainer.innerHTML = '';
        
        // Mostrar mensaje de no resultados si es necesario
        if (filteredProducts.length === 0) {
            if (noResults) noResults.style.display = 'flex';
            return;
        } else {
            if (noResults) noResults.style.display = 'none';
        }
        
        // Renderizar cada producto
        filteredProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.setAttribute('data-category', product.category);
            
            // Badge de destacado (si aplica)
            let badgeHTML = '';
            if (product.featured) {
                badgeHTML = `<div class="product-badge featured" data-i18n="catalog.featured">Destacado</div>`;
            }
            
            // Construir lista de características
            let featuresHTML = '';
            if (product.features && product.features.length) {
                featuresHTML = '<ul class="product-features">';
                product.features.forEach(feature => {
                    featuresHTML += `<li>${feature}</li>`;
                });
                featuresHTML += '</ul>';
            }
            
            // Plantilla del producto
            productCard.innerHTML = `
                ${badgeHTML}
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name} Software" loading="lazy">
                </div>
                <div class="product-content">
                    <h2 class="product-title">${product.name}</h2>
                    <div class="product-meta">
                        <span class="product-version">v${product.version}</span>
                        <span class="product-category" data-i18n="catalog.${product.category}">${product.category}</span>
                    </div>
                    <p class="product-price">${window.infinityUtils.formatPrice(product.price)}</p>
                    <p class="product-description">${product.description}</p>
                    ${featuresHTML}
                    <div class="product-actions">
                        <a href="/pages/products/${product.id}/index.html" class="btn btn-outline" data-i18n="buttons.learnMore">Saber más</a>
                        <button class="btn btn-primary add-to-cart" data-product="${product.id}" data-i18n="buttons.addToCart">Añadir al carrito</button>
                    </div>
                </div>
            `;
            
            // Añadir al contenedor
            productsContainer.appendChild(productCard);
            
            // Configurar eventos para el botón "Añadir al carrito"
            const addToCartBtn = productCard.querySelector('.add-to-cart');
            if (addToCartBtn && window.shoppingCart) {
                addToCartBtn.addEventListener('click', function() {
                    window.shoppingCart.addItem(window.shoppingCart.getProductInfo(product.id));
                });
            }
        });
        
        // Traducir los elementos recién agregados
        if (window.i18n && window.i18n.initialized) {
            window.i18n.translatePage();
        }
    }
    
    /**
     * Muestra un modal para notificar sobre futuros lanzamientos
     * @param {string} productId - ID del producto por lanzar
     */
    function showNotifyModal(productId) {
        // En un entorno real, esto mostraría un modal para capturar el email
        // Aquí simulamos una notificación de éxito
        
        window.infinityUtils.showNotification(
            window.i18n && window.i18n.initialized ? 
                window.i18n.translate('catalog.notifySuccess') : 
                'Te notificaremos cuando este producto esté disponible',
            'success'
        );
    }
    
    // Inicializar catálogo
    initCatalog();
});