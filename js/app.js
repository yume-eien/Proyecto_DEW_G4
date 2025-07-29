document.addEventListener('DOMContentLoaded', () => {
    // --- Lógica del Banner ---
    const slides = document.querySelectorAll('.slide');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    let currentSlide = 0;
    let slideInterval;

    function showSlide(n) {
        if (n >= slides.length) currentSlide = 0;
        else if (n < 0) currentSlide = slides.length - 1;
        else currentSlide = n;

        slides.forEach(slide => slide.classList.remove('active'));
        slides[currentSlide].classList.add('active');
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function startInterval() {
        slideInterval = setInterval(nextSlide, 5000);
    }

    function resetInterval() {
        clearInterval(slideInterval);
        startInterval();
    }

    if (nextBtn && prevBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            resetInterval();
        });

        prevBtn.addEventListener('click', () => {
            showSlide(currentSlide - 1);
            resetInterval();
        });
    }
    
    showSlide(currentSlide);
    startInterval();

    // --- Lógica del Carrito de Compras ---
    const cartIcon = document.querySelector('.cart-icon');
    const cartModal = document.querySelector('.cart-modal');
    const closeCartBtn = document.querySelector('.close-cart');
    const addToCartButtons = document.querySelectorAll('.buy-button');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCountSpan = document.querySelector('.cart-count');
    const cartTotalSpan = document.getElementById('cart-total-amount');

    let cart = [];

    // Event Listeners
    cartIcon.addEventListener('click', toggleCart);
    closeCartBtn.addEventListener('click', toggleCart);

    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const productCard = e.target.closest('.product-card');
            const product = {
                id: productCard.dataset.id,
                name: productCard.dataset.name,
                price: parseFloat(productCard.dataset.price),
                quantity: 1
            };
            addToCart(product);
        });
    });

    function toggleCart() {
        cartModal.classList.toggle('open');
    }

    function addToCart(product) {
        const existingProductIndex = cart.findIndex(item => item.id === product.id);

        if (existingProductIndex > -1) {
            cart[existingProductIndex].quantity += 1;
        } else {
            cart.push(product);
        }
        
        updateCartUI();
    }

    function updateCartUI() {
        cartItemsContainer.innerHTML = ''; // Limpiar el carrito
        let total = 0;
        let totalItems = 0;

        cart.forEach(item => {
            total += item.price * item.quantity;
            totalItems += item.quantity;

            const cartItemElement = document.createElement('div');
            cartItemElement.classList.add('cart-item');
            cartItemElement.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name} (x${item.quantity})</h4>
                    <p>$${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <button class="remove-item" data-id="${item.id}">&times;</button>
            `;
            cartItemsContainer.appendChild(cartItemElement);
        });

        cartTotalSpan.textContent = total.toFixed(2);
        cartCountSpan.textContent = totalItems;

        // Añadir event listeners a los nuevos botones de eliminar
        addRemoveEventListeners();
    }
    
    function addRemoveEventListeners() {
        const removeButtons = document.querySelectorAll('.remove-item');
        removeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const idToRemove = e.target.dataset.id;
                removeFromCart(idToRemove);
            });
        });
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        updateCartUI();
    }
});

// --- Lógica del Icono de WhatsApp ---
var icon = document.getElementById('whatsappIcon');
icon.style.width = "60px";
icon.style.height = "60px";

icon.addEventListener('mouseover', function () {
    icon.style.width = "80px";
    icon.style.height = "80px";
});

icon.addEventListener('mouseout', function () {
    icon.style.width = "60px";
    icon.style.height = "60px";
});


window.addEventListener('scroll', function () {
    var icon = document.querySelector('.whatsapp-container');
    if (window.scrollY > 300) {
        icon.style.opacity = "1";    // más nítido cuando haces scroll
    } else {
        icon.style.opacity = "0.4";  // más transparente al inicio
    }
});

var whatsappLink = document.getElementById('whatsappLink');
whatsappLink.addEventListener('click', function (event) {
    event.preventDefault();
    var phoneNumber = '51983412557'; // Reemplaza con tu número de WhatsApp
    var message = 'Hola, estoy interesado en tus productos.';
    var url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
});
