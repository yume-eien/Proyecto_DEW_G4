/**
 * Infinity Ascend Software - Funcionalidades para páginas de usuario
 */

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación de usuario
    if (!checkUserAuth()) {
        // Redirigir a la página de login si no está autenticado
        redirectToLogin();
        return;
    }
    
    // Inicializar componentes de la página
    initUserDashboard();
    initCopyButtons();
    initLogoutButton();
    
    // Cargar datos específicos según la página
    const currentPage = getCurrentPage();
    
    if (currentPage === 'purchases') {
        loadPurchasesData();
    } else if (currentPage === 'refunds') {
        loadRefundsData();
    }
});

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} - true si está autenticado, false si no
 */
function checkUserAuth() {
    // En un entorno real, esto verificaría un token JWT o una cookie de sesión
    // Aquí simulamos una autenticación básica con localStorage
    
    // Para fines de demostración, siempre consideramos al usuario como autenticado
    // En un entorno real, descomentar la siguiente línea:
    // return localStorage.getItem('user_authenticated') === 'true';
    
    return true;
}

/**
 * Redirige al usuario a la página de login
 */
function redirectToLogin() {
    // Guardar la URL actual para redirigir después del login
    localStorage.setItem('login_redirect', window.location.href);
    
    // Redirigir a la página de login
    window.location.href = '/login.html';
}

/**
 * Obtiene la página actual basada en la URL
 * @returns {string} - Nombre de la página actual
 */
function getCurrentPage() {
    const path = window.location.pathname;
    
    if (path.includes('/user/purchases.html')) {
        return 'purchases';
    } else if (path.includes('/user/refunds.html')) {
        return 'refunds';
    } else {
        return 'dashboard';
    }
}

/**
 * Inicializa los componentes del dashboard de usuario
 */
function initUserDashboard() {
    // Aquí se inicializarían componentes específicos del dashboard
    // como gráficos, tablas dinámicas, etc.
}

/**
 * Inicializa los botones de copiar al portapapeles
 */
function initCopyButtons() {
    const copyButtons = document.querySelectorAll('.copy-btn');
    
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const textToCopy = this.getAttribute('data-clipboard-text');
            
            // Copiar al portapapeles
            navigator.clipboard.writeText(textToCopy)
                .then(() => {
                    // Cambiar temporalmente el ícono a un check
                    const originalHTML = this.innerHTML;
                    this.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                    
                    // Mostrar notificación
                    window.infinityUtils.showNotification(
                        window.i18n && window.i18n.initialized ? 
                            window.i18n.translate('user.copied') : 
                            'Copiado al portapapeles',
                        'success'
                    );
                    
                    // Restaurar el ícono original después de un tiempo
                    setTimeout(() => {
                        this.innerHTML = originalHTML;
                    }, 2000);
                })
                .catch(err => {
                    console.error('Error al copiar al portapapeles:', err);
                    
                    // Mostrar error
                    window.infinityUtils.showNotification(
                        window.i18n && window.i18n.initialized ? 
                            window.i18n.translate('user.copyError') : 
                            'Error al copiar al portapapeles',
                        'error'
                    );
                });
        });
    });
}

/**
 * Inicializa el botón de cerrar sesión
 */
function initLogoutButton() {
    const logoutButton = document.getElementById('user-logout');
    
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // En un entorno real, esto llamaría a una API para invalidar la sesión
            // Aquí simplemente simulamos el cierre de sesión
            localStorage.removeItem('user_authenticated');
            
            // Redirigir a la página de inicio
            window.location.href = '/index.html';
        });
    }
}

/**
 * Carga los datos de compras del usuario
 * En un entorno real, esto cargaría datos desde una API
 */
function loadPurchasesData() {
    // Aquí se cargarían los datos desde una API
    // Simulamos una carga de datos
    
    const purchasesContainer = document.getElementById('purchases-list');
    
    if (purchasesContainer) {
        // Mostrar indicador de carga
        purchasesContainer.innerHTML = '<div class="loading-indicator">Cargando compras...</div>';
        
        // Simular tiempo de carga
        setTimeout(() => {
            // Datos de ejemplo
            const purchases = [
                {
                    id: 'ORD-1234567890',
                    date: '15/05/2025',
                    products: ['Autoflow'],
                    total: 49.99,
                    status: 'Completado'
                },
                {
                    id: 'ORD-0987654321',
                    date: '10/05/2025',
                    products: ['BulletProof'],
                    total: 39.99,
                    status: 'Completado'
                }
            ];
            
            // Renderizar tabla de compras
            renderPurchasesTable(purchases, purchasesContainer);
        }, 1000);
    }
}

/**
 * Renderiza la tabla de compras
 * @param {Array} purchases - Array de objetos de compra
 * @param {HTMLElement} container - Contenedor donde renderizar
 */
function renderPurchasesTable(purchases, container) {
    if (purchases.length === 0) {
        container.innerHTML = '<div class="empty-state">No hay compras para mostrar.</div>';
        return;
    }
    
    const tableHTML = `
        <div class="purchases-table-container">
            <table class="purchases-table">
                <thead>
                    <tr>
                        <th>ID Pedido</th>
                        <th>Fecha</th>
                        <th>Productos</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${purchases.map(purchase => `
                        <tr>
                            <td class="purchase-id">${purchase.id}</td>
                            <td>${purchase.date}</td>
                            <td>
                                <div class="purchase-products">
                                    ${purchase.products.map(product => `
                                        <span class="product-badge">${product}</span>
                                    `).join('')}
                                </div>
                            </td>
                            <td>${window.infinityUtils.formatPrice(purchase.total)}</td>
                            <td>${purchase.status}</td>
                            <td>
                                <button class="btn btn-sm btn-outline view-purchase" data-id="${purchase.id}">Ver detalles</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = tableHTML;
    
    // Configurar eventos para botones de ver detalles
    const viewButtons = container.querySelectorAll('.view-purchase');
    
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const purchaseId = this.getAttribute('data-id');
            viewPurchaseDetails(purchaseId);
        });
    });
}

/**
 * Muestra los detalles de una compra específica
 * @param {string} purchaseId - ID de la compra
 */
function viewPurchaseDetails(purchaseId) {
    // En un entorno real, esto abriría un modal o redigiría a una página de detalles
    // Aquí simplemente mostramos una notificación
    window.infinityUtils.showNotification(
        window.i18n && window.i18n.initialized ? 
            window.i18n.translate('user.viewingPurchase', { id: purchaseId }) : 
            `Viendo detalles de la compra ${purchaseId}`,
        'info'
    );
}

/**
 * Carga los datos de reembolsos del usuario
 * En un entorno real, esto cargaría datos desde una API
 */
function loadRefundsData() {
    // Implementación similar a loadPurchasesData pero para reembolsos
}