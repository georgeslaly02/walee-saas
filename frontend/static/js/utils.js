/**
 * Utilitaires globaux pour Walee
 * Gestion des toasts, loading, validation, etc.
 */

// ============================================
// TOAST NOTIFICATIONS
// ============================================

/**
 * Afficher un toast notification
 * @param {string} message - Message à afficher
 * @param {string} type - Type (success, error, warning, info)
 * @param {string} title - Titre optionnel
 * @param {number} duration - Durée en ms (défaut: 5000)
 */
function showToast(message, type = 'info', title = '', duration = 5000) {
    const toastContainer = document.querySelector('[x-data="toastManager()"]');
    if (!toastContainer || !toastContainer.__x) {
        console.warn('Toast container not found');
        return;
    }
    
    const toastManager = toastContainer.__x.$data;
    if (toastManager && toastManager.show) {
        toastManager.show(message, type);
    } else {
        // Fallback: afficher dans la console
        console.log(`[${type.toUpperCase()}] ${title || message}`);
    }
}

// ============================================
// LOADING OVERLAY
// ============================================

let loadingTimeout;

/**
 * Afficher l'overlay de chargement
 * @param {string} message - Message à afficher
 */
function showLoading(message = 'Chargement...') {
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingMessage = document.getElementById('loading-message');
    
    if (loadingOverlay) {
        if (loadingMessage) {
            loadingMessage.textContent = message;
        }
        loadingOverlay.style.display = 'flex';
        loadingOverlay.classList.remove('hidden');
    } else {
        console.warn('Loading overlay not found');
    }
}

/**
 * Masquer l'overlay de chargement
 */
function hideLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    
    if (loadingOverlay) {
        // Petit délai pour éviter les clignotements
        loadingTimeout = setTimeout(() => {
            loadingOverlay.style.display = 'none';
            loadingOverlay.classList.add('hidden');
        }, 300);
    }
}

/**
 * Forcer la fermeture du loading
 */
function forceHideLoading() {
    clearTimeout(loadingTimeout);
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
        loadingOverlay.classList.add('hidden');
    }
}

// ============================================
// VALIDATION
// ============================================

/**
 * Valider un email
 * @param {string} email - Email à valider
 * @returns {boolean}
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Valider un téléphone
 * @param {string} phone - Téléphone à valider
 * @returns {boolean}
 */
function validatePhone(phone) {
    const re = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    return re.test(phone);
}

/**
 * Valider un mot de passe
 * @param {string} password - Mot de passe à valider
 * @returns {object} {valid: boolean, errors: array}
 */
function validatePassword(password) {
    const errors = [];
    
    if (password.length < 8) {
        errors.push('Au moins 8 caractères');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Au moins une majuscule');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Au moins une minuscule');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Au moins un chiffre');
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

// ============================================
// REDIRECTION
// ============================================

/**
 * Rediriger vers une URL
 * @param {string} url - URL de destination
 * @param {number} delay - Délai en ms avant redirection
 */
function redirect(url, delay = 0) {
    if (delay > 0) {
        setTimeout(() => {
            window.location.href = url;
        }, delay);
    } else {
        window.location.href = url;
    }
}

/**
 * Rediriger vers le login si non authentifié
 */
function redirectSiNonAuthentifie() {
    if (!estAuthentifie()) {
        redirect('/login/', 500);
    }
}

/**
 * Rediriger vers le dashboard si authentifié
 */
function redirectSiAuthentifie() {
    if (estAuthentifie()) {
        redirect('/dashboard/', 500);
    }
}

// ============================================
// UTILITAIRES DE DONNÉES
// ============================================

/**
 * Récupérer l'utilisateur depuis le localStorage
 * @returns {object|null}
 */
function getStoredUser() {
    const userJson = localStorage.getItem('user');
    if (!userJson || userJson === 'undefined') return null;
    try {
        return JSON.parse(userJson);
    } catch (e) {
        console.error('Erreur parsing user:', e);
        return null;
    }
}

/**
 * Récupérer le token depuis localStorage ou cookies
 * @returns {string|null}
 */
function getToken() {
    let token = localStorage.getItem('access_token');
    
    if (!token) {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'access_token') {
                token = value;
                break;
            }
        }
    }
    
    return token || null;
}

/**
 * Vérifier si l'utilisateur est authentifié
 * @returns {boolean}
 */
function estAuthentifie() {
    const token = getToken();
    const user = getStoredUser();
    return !!(token && user);
}

// ============================================
// UTILITAIRES DE FORMATAGE
// ============================================

/**
 * Formater une date
 * @param {string|Date} date - Date à formater
 * @param {string} format - Format (ex: 'DD/MM/YYYY')
 * @returns {string}
 */
function formatDate(date, format = 'DD/MM/YYYY') {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    return format
        .replace('DD', day)
        .replace('MM', month)
        .replace('YYYY', year);
}

/**
 * Formater une devise
 * @param {number} amount - Montant
 * @param {string} currency - Code devise (ex: 'XOF')
 * @returns {string}
 */
function formatCurrency(amount, currency = 'XOF') {
    const formatter = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currency,
    });
    return formatter.format(amount);
}

/**
 * Formater un téléphone
 * @param {string} phone - Numéro de téléphone
 * @returns {string}
 */
function formatPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    }
    return phone;
}

// ============================================
// UTILITAIRES DE TABLEAU
// ============================================

/**
 * Trier un tableau d'objets
 * @param {array} array - Tableau à trier
 * @param {string} key - Clé à utiliser pour le tri
 * @param {string} order - Ordre ('asc' ou 'desc')
 * @returns {array}
 */
function sortArray(array, key, order = 'asc') {
    return [...array].sort((a, b) => {
        if (a[key] < b[key]) return order === 'asc' ? -1 : 1;
        if (a[key] > b[key]) return order === 'asc' ? 1 : -1;
        return 0;
    });
}

/**
 * Filtrer un tableau d'objets
 * @param {array} array - Tableau à filtrer
 * @param {string} key - Clé à utiliser pour le filtre
 * @param {string} value - Valeur à chercher
 * @returns {array}
 */
function filterArray(array, key, value) {
    return array.filter(item => 
        String(item[key]).toLowerCase().includes(String(value).toLowerCase())
    );
}

/**
 * Paginer un tableau
 * @param {array} array - Tableau à paginer
 * @param {number} page - Numéro de page (1-based)
 * @param {number} pageSize - Taille de la page
 * @returns {object} {items: array, totalPages: number, currentPage: number}
 */
function paginateArray(array, page = 1, pageSize = 10) {
    const totalPages = Math.ceil(array.length / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    return {
        items: array.slice(start, end),
        totalPages: totalPages,
        currentPage: page,
        total: array.length
    };
}

// ============================================
// UTILITAIRES DE STOCKAGE
// ============================================

/**
 * Sauvegarder des données dans localStorage
 * @param {string} key - Clé
 * @param {any} value - Valeur
 */
function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error('Erreur localStorage:', e);
    }
}

/**
 * Récupérer des données depuis localStorage
 * @param {string} key - Clé
 * @param {any} defaultValue - Valeur par défaut
 * @returns {any}
 */
function getFromStorage(key, defaultValue = null) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
    } catch (e) {
        console.error('Erreur localStorage:', e);
        return defaultValue;
    }
}

/**
 * Supprimer des données depuis localStorage
 * @param {string} key - Clé
 */
function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (e) {
        console.error('Erreur localStorage:', e);
    }
}

// ============================================
// UTILITAIRES DE DÉBOGAGE
// ============================================

/**
 * Logger avec timestamp
 * @param {string} message - Message
 * @param {string} level - Niveau (log, warn, error, info)
 */
function logWithTimestamp(message, level = 'log') {
    const timestamp = new Date().toLocaleTimeString();
    console[level](`[${timestamp}] ${message}`);
}

/**
 * Afficher les infos de débogage
 */
function showDebugInfo() {
    console.group('🐛 Debug Info');
    console.log('Token:', !!getToken());
    console.log('User:', getStoredUser());
    console.log('Authenticated:', estAuthentifie());
    console.log('localStorage:', { ...localStorage });
    console.log('cookies:', document.cookie);
    console.groupEnd();
}

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showToast,
        showLoading,
        hideLoading,
        forceHideLoading,
        validateEmail,
        validatePhone,
        validatePassword,
        redirect,
        redirectSiNonAuthentifie,
        redirectSiAuthentifie,
        getStoredUser,
        getToken,
        estAuthentifie,
        formatDate,
        formatCurrency,
        formatPhone,
        sortArray,
        filterArray,
        paginateArray,
        saveToStorage,
        getFromStorage,
        removeFromStorage,
        logWithTimestamp,
        showDebugInfo
    };
}
