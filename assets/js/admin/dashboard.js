/**
 * Infinity Ascend Software - Dashboard del panel de administración
 * Gestiona la visualización y funcionalidades del panel de control para administradores.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    if (!checkAdminAuth()) {
        // Redirigir a la página de login si no está autenticado
        window.location.href = '/admin/login.html';
        return;
    }
    
    // Inicializar componentes del dashboard
    initDashboard();
});

/**
 * Verifica si el usuario está autenticado como administrador
 * @returns {boolean} - true si está autenticado, false en caso contrario
 */
function checkAdminAuth() {
    // En un entorno real, esto verificaría un token JWT o una sesión
    // Por ahora, simplemente verificamos si existe un flag en localStorage
    return localStorage.getItem('admin_authenticated') === 'true';
}

/**
 * Inicializa los componentes del dashboard
 */
function initDashboard() {
    // Cargar datos de resumen
    loadSummaryData();
    
    // Cargar gráficos
    initCharts();
    
    // Cargar últimas ventas
    loadRecentSales();
    
    // Cargar resumen de community setters
    loadSettersSummary();
    
    // Inicializar eventos de filtros
    setupFilterEvents();
}

/**
 * Carga datos de resumen para el dashboard
 */
function loadSummaryData() {
    // En un entorno real, estos datos se cargarían desde una API
    // Aquí simulamos datos para la demostración
    
    const summaryData = {
        totalSales: {
            value: 2547,
            change: 12.3, // positivo indica aumento
            period: 'mes' // periodo de comparación
        },
        revenue: {
            value: 124859.95,
            change: 8.7,
            period: 'mes'
        },
        averageOrder: {
            value: 49.01,
            change: -2.1, // negativo indica disminución
            period: 'mes'
        },
        activeSetters: {
            value: 28,
            change: 40,
            period: 'mes'
        }
    };
    
    // Actualizar tarjetas de resumen
    updateSummaryCard('total-sales', summaryData.totalSales);
    updateSummaryCard('total-revenue', summaryData.revenue, true); // formatear como dinero
    updateSummaryCard('average-order', summaryData.averageOrder, true);
    updateSummaryCard('active-setters', summaryData.activeSetters);
}

/**
 * Actualiza una tarjeta de resumen con datos
 * @param {string} id - ID del elemento
 * @param {Object} data - Datos para mostrar
 * @param {boolean} isMoney - Indica si el valor debe formatearse como dinero
 */
function updateSummaryCard(id, data, isMoney = false) {
    const card = document.getElementById(id);
    if (!card) return;
    
    const valueElement = card.querySelector('.summary-value');
    const changeElement = card.querySelector('.summary-change');
    
    if (valueElement) {
        if (isMoney) {
            valueElement.textContent = formatMoney(data.value);
        } else {
            valueElement.textContent = data.value.toLocaleString();
        }
    }
    
    if (changeElement) {
        // Formatear el porcentaje de cambio
        const changeText = `${data.change > 0 ? '+' : ''}${data.change}% vs ${data.period} anterior`;
        changeElement.textContent = changeText;
        
        // Aplicar clase según si es positivo o negativo
        changeElement.classList.remove('positive', 'negative');
        changeElement.classList.add(data.change >= 0 ? 'positive' : 'negative');
    }
}

/**
 * Inicializa los gráficos del dashboard
 */
function initCharts() {
    // Gráfico de ventas por software
    const salesByProductCtx = document.getElementById('sales-by-product');
    if (salesByProductCtx) {
        // Colores para los gráficos que coinciden con la paleta del sitio
        const chartColors = [
            'rgba(0, 119, 255, 0.8)',
            'rgba(0, 85, 204, 0.8)'
        ];
        
        // Datos de ejemplo
        const salesData = {
            labels: ['Autoflow', 'BulletProof'],
            datasets: [{
                data: [63, 37], // porcentajes
                backgroundColor: chartColors,
                borderWidth: 0
            }]
        };
        
        // Configuración y creación del gráfico
        new Chart(salesByProductCtx, {
            type: 'doughnut',
            data: salesData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.raw}%`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Gráfico de ventas por mes
    const monthlySalesCtx = document.getElementById('monthly-sales');
    if (monthlySalesCtx) {
        // Datos de ventas mensuales
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const monthlySalesData = {
            labels: months,
            datasets: [
                {
                    label: 'Ventas 2025',
                    data: [12500, 15200, 18100, 21000, 24500, 0, 0, 0, 0, 0, 0, 0], // datos hasta mayo
                    borderColor: 'rgba(0, 119, 255, 1)',
                    backgroundColor: 'rgba(0, 119, 255, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Ventas 2024',
                    data: [10200, 12500, 15800, 18200, 19500, 22100, 25800, 28300, 26200, 24100, 27500, 32100],
                    borderColor: 'rgba(203, 210, 217, 1)',
                    borderWidth: 2,
                    tension: 0.4,
                    borderDash: [5, 5],
                    fill: false
                }
            ]
        };
        
        // Configuración y creación del gráfico
        new Chart(monthlySalesCtx, {
            type: 'line',
            data: monthlySalesData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: $${context.raw.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }
}

/**
 * Carga las últimas ventas
 */
function loadRecentSales() {
    // En un entorno real, estos datos se cargarían desde una API
    const recentSales = [
        {
            id: 'ORD-2025051501',
            date: '2025-05-15T10:23:45',
            customer: 'John Doe',
            email: 'john.doe@example.com',
            products: ['Autoflow'],
            total: 49.99,
            setter: 'Maria Rodriguez'
        },
        {
            id: 'ORD-2025051502',
            date: '2025-05-15T11:12:30',
            customer: 'Alice Smith',
            email: 'alice.smith@example.com',
            products: ['BulletProof'],
            total: 39.99,
            setter: null
        },
        {
            id: 'ORD-2025051503',
            date: '2025-05-15T14:45:10',
            customer: 'Robert Johnson',
            email: 'robert.johnson@example.com',
            products: ['Autoflow', 'BulletProof'],
            total: 89.98,
            setter: 'Carlos Mendez'
        },
        {
            id: 'ORD-2025051402',
            date: '2025-05-14T16:33:22',
            customer: 'Emma Williams',
            email: 'emma.williams@example.com',
            products: ['Autoflow'],
            total: 49.99,
            setter: 'Maria Rodriguez'
        },
        {
            id: 'ORD-2025051401',
            date: '2025-05-14T09:15:40',
            customer: 'Michael Brown',
            email: 'michael.brown@example.com',
            products: ['BulletProof'],
            total: 39.99,
            setter: null
        }
    ];
    
    // Renderizar la tabla de ventas recientes
    const salesTableBody = document.querySelector('#recent-sales-table tbody');
    if (salesTableBody) {
        salesTableBody.innerHTML = '';
        
        recentSales.forEach(sale => {
            const row = document.createElement('tr');
            
            // Formatear fecha
            const date = new Date(sale.date);
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            row.innerHTML = `
                <td>${sale.id}</td>
                <td>${formattedDate}</td>
                <td>${sale.customer}</td>
                <td>${sale.email}</td>
                <td>${sale.products.join(', ')}</td>
                <td>${formatMoney(sale.total)}</td>
                <td>${sale.setter || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline view-sale" data-id="${sale.id}">Ver</button>
                </td>
            `;
            
            salesTableBody.appendChild(row);
        });
        
        // Configurar eventos para botones de ver
        const viewButtons = document.querySelectorAll('.view-sale');
        viewButtons.forEach(button => {
            button.addEventListener('click', function() {
                const saleId = this.getAttribute('data-id');
                // En un entorno real, esto redireccionaría a la página de detalles de la venta
                alert(`Ver detalles de venta: ${saleId}`);
            });
        });
    }
}

/**
 * Carga el resumen de community setters
 */
function loadSettersSummary() {
    // En un entorno real, estos datos se cargarían desde una API
    const settersData = [
        {
            name: 'Maria Rodriguez',
            sales: 42,
            revenue: 2089.58,
            commission: 208.96
        },
        {
            name: 'Carlos Mendez',
            sales: 37,
            revenue: 1849.63,
            commission: 184.96
        },
        {
            name: 'Sarah Johnson',
            sales: 28,
            revenue: 1399.72,
            commission: 139.97
        },
        {
            name: 'Michael Chen',
            sales: 22,
            revenue: 1089.78,
            commission: 108.98
        },
        {
            name: 'Lisa Patel',
            sales: 18,
            revenue: 879.82,
            commission: 87.98
        }
    ];
    
    // Renderizar la tabla de setters
    const settersTableBody = document.querySelector('#setters-table tbody');
    if (settersTableBody) {
        settersTableBody.innerHTML = '';
        
        settersData.forEach(setter => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${setter.name}</td>
                <td>${setter.sales}</td>
                <td>${formatMoney(setter.revenue)}</td>
                <td>${formatMoney(setter.commission)}</td>
                <td>
                    <button class="btn btn-sm btn-outline view-setter" data-name="${setter.name}">Ver</button>
                </td>
            `;
            
            settersTableBody.appendChild(row);
        });
        
        // Configurar eventos para botones de ver
        const viewButtons = document.querySelectorAll('.view-setter');
        viewButtons.forEach(button => {
            button.addEventListener('click', function() {
                const setterName = this.getAttribute('data-name');
                // En un entorno real, esto redireccionaría a la página de detalles del setter
                alert(`Ver detalles de setter: ${setterName}`);
            });
        });
    }
}

/**
 * Configura eventos para los filtros del dashboard
 */
function setupFilterEvents() {
    const periodFilters = document.querySelectorAll('.period-filter');
    
    periodFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            // Remover clase activa de todos los filtros
            periodFilters.forEach(f => f.classList.remove('active'));
            
            // Añadir clase activa al filtro seleccionado
            this.classList.add('active');
            
            // Obtener el periodo seleccionado
            const period = this.getAttribute('data-period');
            
            // En un entorno real, esto actualizaría los datos según el periodo
            alert(`Filtrar por periodo: ${period}`);
            
            // Recargar datos (simulado)
            setTimeout(() => {
                loadSummaryData();
                initCharts();
                loadRecentSales();
                loadSettersSummary();
            }, 300);
        });
    });
}

/**
 * Formatea un valor como dinero
 * @param {number} value - Valor a formatear
 * @returns {string} - Valor formateado como dinero
 */
function formatMoney(value) {
    return '$' + value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}