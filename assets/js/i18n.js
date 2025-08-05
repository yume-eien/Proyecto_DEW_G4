/**
 * Sistema de Internacionalización
 * Gestiona la traducción del sitio a los diferentes idiomas disponibles.
 */

class I18nManager {
    constructor() {
        this.currentLanguage = 'en'; // Idioma por defecto
        this.languages = ['en', 'es', 'fr']; // Idiomas disponibles
        this.translations = {}; // Almacena todas las traducciones
        this.initialized = false;
    }

    /**
     * Inicializa el sistema de i18n y carga las traducciones
     */
    async init() {
        // Verificar si hay un idioma guardado en localStorage
        const savedLang = localStorage.getItem('infinity-language');
        if (savedLang && this.languages.includes(savedLang)) {
            this.currentLanguage = savedLang;
        } else {
            // Intentar detectar el idioma del navegador
            const browserLang = navigator.language.split('-')[0];
            if (this.languages.includes(browserLang)) {
                this.currentLanguage = browserLang;
            }
        }

        // Cargar las traducciones para el idioma actual
        await this.loadTranslations(this.currentLanguage);
        
        // Configurar los botones de selección de idioma
        this.setupLanguageButtons();
        
        // Marcar como inicializado
        this.initialized = true;
    }

    /**
     * Carga los archivos de traducción para un idioma específico
     * @param {string} lang - Código de idioma a cargar
     */
    async loadTranslations(lang) {
        try {
            // Cargar todos los archivos JSON de traducción para el idioma
            const files = ['general', 'products', 'legal'];
            const requests = files.map(file => 
                fetch(`/locales/${lang}/${file}.json`)
                    .then(response => response.json())
            );
            
            // Esperar a que todas las promesas se resuelvan
            const results = await Promise.all(requests);
            
            // Combinar todos los resultados en un solo objeto
            this.translations = results.reduce((acc, curr) => ({...acc, ...curr}), {});
            
            // Aplicar las traducciones al DOM
            this.translatePage();
            
            // Guardar la preferencia en localStorage
            localStorage.setItem('infinity-language', lang);
            
            // Actualizar el atributo lang en el HTML
            document.documentElement.lang = lang;
            
        } catch (error) {
            console.error(`Error loading translations for ${lang}:`, error);
            
            // Si hay un error, intentar cargar el inglés como respaldo
            if (lang !== 'en') {
                console.warn('Falling back to English translations');
                await this.loadTranslations('en');
            }
        }
    }

    /**
     * Configura los botones de selección de idioma en la interfaz
     */
    setupLanguageButtons() {
        const languageButtons = document.querySelectorAll('.language-btn');
        
        // Marcar el botón del idioma actual como activo
        languageButtons.forEach(button => {
            const lang = button.getAttribute('data-lang');
            
            if (lang === this.currentLanguage) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
            
            // Añadir eventos de clic para cambiar el idioma
            button.addEventListener('click', async () => {
                if (lang !== this.currentLanguage) {
                    this.currentLanguage = lang;
                    
                    // Actualizar clases activas en los botones
                    languageButtons.forEach(btn => {
                        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
                    });
                    
                    // Cargar y aplicar las nuevas traducciones
                    await this.loadTranslations(lang);
                }
            });
        });
    }

    /**
     * Aplica las traducciones al contenido de la página
     */
    translatePage() {
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getTranslation(key);
            
            if (translation) {
                // Verificar si el elemento es un input o un textarea
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    if (element.getAttribute('placeholder')) {
                        element.setAttribute('placeholder', translation);
                    } else {
                        element.value = translation;
                    }
                } else {
                    element.textContent = translation;
                }
            }
        });
        
        // Traducir también los elementos con atributos traducibles
        const attrElements = document.querySelectorAll('[data-i18n-attr]');
        
        attrElements.forEach(element => {
            const attrData = element.getAttribute('data-i18n-attr').split(':');
            if (attrData.length === 2) {
                const attr = attrData[0];
                const key = attrData[1];
                const translation = this.getTranslation(key);
                
                if (translation) {
                    element.setAttribute(attr, translation);
                }
            }
        });
    }

    /**
     * Obtiene una traducción por su clave
     * @param {string} key - Clave de traducción en formato "seccion.subseccion.clave"
     * @returns {string} - Texto traducido o la clave si no se encuentra traducción
     */
    getTranslation(key) {
        // Dividir la clave en partes (ej: "nav.home" -> ["nav", "home"])
        const parts = key.split('.');
        
        // Navegar por el objeto de traducciones siguiendo la estructura de la clave
        let result = this.translations;
        for (const part of parts) {
            if (result && result[part] !== undefined) {
                result = result[part];
            } else {
                // Si no se encuentra la clave, retornar la clave original
                return key;
            }
        }
        
        return result;
    }

    /**
     * Traduce un texto dinámicamente (útil para mensajes generados por JS)
     * @param {string} key - Clave de traducción
     * @param {Object} params - Parámetros para reemplazar en la traducción
     * @returns {string} - Texto traducido con los parámetros aplicados
     */
    translate(key, params = {}) {
        let text = this.getTranslation(key);
        
        // Reemplazar variables en el texto (formato: {{variable}})
        if (params) {
            Object.entries(params).forEach(([param, value]) => {
                text = text.replace(new RegExp(`{{${param}}}`, 'g'), value);
            });
        }
        
        return text;
    }

    /**
     * Formatea un número según el formato del idioma actual
     * @param {number} number - Número a formatear
     * @param {Object} options - Opciones para el formato (ver Intl.NumberFormat)
     * @returns {string} - Número formateado
     */
    formatNumber(number, options = {}) {
        return new Intl.NumberFormat(this.currentLanguage, options).format(number);
    }

    /**
     * Formatea una fecha según el formato del idioma actual
     * @param {Date|string|number} date - Fecha a formatear
     * @param {Object} options - Opciones para el formato (ver Intl.DateTimeFormat)
     * @returns {string} - Fecha formateada
     */
    formatDate(date, options = {}) {
        const dateObj = date instanceof Date ? date : new Date(date);
        return new Intl.DateTimeFormat(this.currentLanguage, options).format(dateObj);
    }

    /**
     * Formatea un precio con el símbolo de moneda apropiado
     * @param {number} amount - Cantidad a formatear
     * @param {string} currency - Código de moneda (USD, EUR, etc.)
     * @returns {string} - Precio formateado
     */
    formatPrice(amount, currency = 'USD') {
        return this.formatNumber(amount, {
            style: 'currency',
            currency: currency
        });
    }
}

// Crear e inicializar la instancia global
const i18n = new I18nManager();

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    await i18n.init();
});

// Exponer la instancia globalmente para uso en otros scripts
window.i18n = i18n;