// Usuarios predefinidos (en un sistema real esto vendría de una base de datos)
const users = [
    {
        id: 1,
        nombre: "Admin",
        apellido: "Daycor",
        email: "admin@daycorsas.com",
        password: "Admin123*",
        tipo: "admin",
        activo: true
    },
    {
        id: 2,
        nombre: "Vendedor",
        apellido: "Ejemplo",
        email: "vendedor@daycorsas.com",
        password: "Vendedor123*",
        tipo: "vendedor",
        activo: true
    }
];

// Variables globales
let currentUser = null;
let cart = [];

// Funciones de autenticación
function login(email, password) {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        if (!user.activo) {
            return { success: false, message: "Tu cuenta está desactivada" };
        }
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        return { success: true, user };
    }
    return { success: false, message: "Credenciales incorrectas" };
}

function register(userData) {
    // Validar que el email no exista
    if (users.some(u => u.email === userData.email)) {
        return { success: false, message: "El email ya está registrado" };
    }
    
    const newUser = {
        id: users.length + 1,
        ...userData,
        tipo: "cliente",
        activo: true
    };
    
    users.push(newUser);
    return { success: true, user: newUser };
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    window.location.href = "login.html";
}

// Funciones del carrito
function addToCart(productId, productName, price, quantity = 1) {
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: price,
            quantity: quantity
        });
    }
    
    updateCartCount();
    saveCartToLocalStorage();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartCount();
    saveCartToLocalStorage();
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        cartCountElement.textContent = count;
    }
}

function saveCartToLocalStorage() {
    localStorage.setItem('daycorCart', JSON.stringify(cart));
}

function loadCartFromLocalStorage() {
    const savedCart = localStorage.getItem('daycorCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
    }
}

// Funciones generales
function showAlert(message, type = 'danger') {
    const alertElement = document.getElementById('loginAlert');
    if (alertElement) {
        alertElement.textContent = message;
        alertElement.className = `alert alert-${type}`;
        alertElement.classList.remove('d-none');
        
        setTimeout(() => {
            alertElement.classList.add('d-none');
        }, 5000);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Cargar usuario y carrito si existe
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        // Redirigir según tipo de usuario
        if (window.location.pathname.endsWith('login.html')) {
            if (currentUser.tipo === 'admin') {
                window.location.href = "admin-clientes.html";
            } else {
                window.location.href = "catalogo.html";
            }
        }
    } else if (!window.location.pathname.endsWith('login.html')) {
        window.location.href = "login.html";
    }
    
    loadCartFromLocalStorage();
    
    // Configurar navbar según usuario
    setupNavbar();
    
    // Inicializar tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Inicializar popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
    
    // Manejar formulario de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            const result = login(email, password);
            if (result.success) {
                if (result.user.tipo === 'admin') {
                    window.location.href = "admin-clientes.html";
                } else {
                    window.location.href = "catalogo.html";
                }
            } else {
                showAlert(result.message);
            }
        });
    }
    
    // Manejar formulario de registro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const userData = {
                nombre: document.getElementById('regNombre').value,
                apellido: document.getElementById('regApellido').value,
                email: document.getElementById('regEmail').value,
                password: document.getElementById('regPassword').value,
                tipoPersona: document.getElementById('regTipoPersona').value,
                razonSocial: document.getElementById('regRazonSocial').value,
                nit: document.getElementById('regNit').value
            };
            
            if (userData.password !== document.getElementById('regConfirmPassword').value) {
                showAlert("Las contraseñas no coinciden");
                return;
            }
            
            const result = register(userData);
            if (result.success) {
                showAlert("Registro exitoso. Por favor inicia sesión.", 'success');
                document.getElementById('loginForm').classList.remove('d-none');
                document.getElementById('registerForm').classList.add('d-none');
            } else {
                showAlert(result.message);
            }
        });
    }
    
    // Manejar cambio entre formularios
    const showRegisterLink = document.getElementById('showRegisterLink');
    const showLoginLink = document.getElementById('showLoginLink');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const backToLoginLink = document.getElementById('backToLoginLink');
    
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('loginForm').classList.add('d-none');
            document.getElementById('registerForm').classList.remove('d-none');
            document.getElementById('forgotPasswordForm').classList.add('d-none');
        });
    }
    
    if (showLoginLink) {
        showLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('loginForm').classList.remove('d-none');
            document.getElementById('registerForm').classList.add('d-none');
            document.getElementById('forgotPasswordForm').classList.add('d-none');
        });
    }
    
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('loginForm').classList.add('d-none');
            document.getElementById('registerForm').classList.add('d-none');
            document.getElementById('forgotPasswordForm').classList.remove('d-none');
        });
    }
    
    if (backToLoginLink) {
        backToLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('loginForm').classList.remove('d-none');
            document.getElementById('registerForm').classList.add('d-none');
            document.getElementById('forgotPasswordForm').classList.add('d-none');
        });
    }
    
    // Manejar tipo de persona en registro
    const tipoPersonaSelect = document.getElementById('regTipoPersona');
    if (tipoPersonaSelect) {
        tipoPersonaSelect.addEventListener('change', function() {
            const juridicaFields = document.getElementById('juridicaFields');
            if (this.value === 'juridica') {
                juridicaFields.style.display = 'block';
                document.getElementById('regRazonSocial').required = true;
                document.getElementById('regNit').required = true;
            } else {
                juridicaFields.style.display = 'none';
                document.getElementById('regRazonSocial').required = false;
                document.getElementById('regNit').required = false;
            }
        });
    }
    
    // Mostrar/ocultar contraseña
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const password = document.getElementById('password');
            const icon = this.querySelector('i');
            if (password.type === 'password') {
                password.type = 'text';
                icon.classList.remove('bi-eye');
                icon.classList.add('bi-eye-slash');
            } else {
                password.type = 'password';
                icon.classList.remove('bi-eye-slash');
                icon.classList.add('bi-eye');
            }
        });
    }
    
    // Botón de logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
});

function setupNavbar() {
    if (currentUser) {
        // Mostrar elementos según el tipo de usuario
        const adminElements = document.querySelectorAll('.admin-only');
        const vendedorElements = document.querySelectorAll('.vendedor-only');
        
        if (currentUser.tipo === 'admin') {
            adminElements.forEach(el => el.style.display = 'block');
            vendedorElements.forEach(el => el.style.display = 'block');
        } else if (currentUser.tipo === 'vendedor') {
            adminElements.forEach(el => el.style.display = 'none');
            vendedorElements.forEach(el => el.style.display = 'block');
        } else {
            // Cliente
            adminElements.forEach(el => el.style.display = 'none');
            vendedorElements.forEach(el => el.style.display = 'none');
        }
        
        // Mostrar nombre de usuario
        const userElements = document.querySelectorAll('.user-name');
        userElements.forEach(el => {
            el.textContent = `${currentUser.nombre} ${currentUser.apellido}`;
        });
    }
}

// Función para cargar productos (simulada)
function loadProducts() {
    return [
        { id: 1, codigo: "PROD-001", nombre: "Cuaderno Norma 100 hojas", precio: 10800, stock: 120, categoria: "escolares" },
        { id: 2, codigo: "PROD-002", nombre: "Esferos Bic x12", precio: 25000, stock: 85, categoria: "escolares" },
        { id: 3, codigo: "PROD-003", nombre: "Resma de papel bond", precio: 18500, stock: 45, categoria: "oficina" },
        { id: 4, codigo: "PROD-004", nombre: "Archivador carta", precio: 32000, stock: 30, categoria: "oficina" }
    ];
}