class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.init();
    }

    init() {
        this.updateCartCount();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Cart icon click
        document.querySelector('.cart-icon').addEventListener('click', () => {
            document.querySelector('.cart-dropdown').classList.toggle('active');
        });

        // Add to cart buttons
        document.querySelectorAll('.purchase-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const bookCard = e.target.closest('.book-card');
                const bookData = {
                    id: bookCard.dataset.bookId,
                    title: bookCard.querySelector('h3').textContent,
                    price: parseFloat(bookCard.querySelector('.price').textContent.replace('$', '')),
                    format: 'digital'
                };
                this.addItem(bookData);
            });
        });

        // Add checkout button handler
        document.querySelector('.checkout-btn').addEventListener('click', () => {
            this.handleCheckout();
        });
    }

    addItem(item) {
        const existingItem = this.items.find(i => i.id === item.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({ ...item, quantity: 1 });
        }
        this.updateCart();
        this.showNotification('Item added to cart');
    }

    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.updateCart();
    }

    updateCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
        this.updateCartCount();
        this.renderCartItems();
    }

    updateCartCount() {
        const count = this.items.reduce((sum, item) => sum + item.quantity, 0);
        document.querySelector('.cart-count').textContent = count;
    }

    renderCartItems() {
        const cartItems = document.querySelector('.cart-items');
        cartItems.innerHTML = this.items.map(item => `
            <div class="cart-item">
                <div class="item-info">
                    <h4>${item.title}</h4>
                    <p>$${item.price} × ${item.quantity}</p>
                </div>
                <button class="remove-item" data-id="${item.id}">×</button>
            </div>
        `).join('');

        const total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        document.querySelector('.cart-total').innerHTML = `
            <strong>Total: $${total.toFixed(2)}</strong>
        `;
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    handleCheckout() {
        const total = this.calculateTotal();
        if (this.items.length === 0) {
            alert('Your cart is empty');
            return;
        }

        let handler = PaystackPop.setup({
            key: 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Replace with your Paystack public key
            email: prompt('Please enter your email:'), // In production, get this from a form
            amount: total * 100, // Convert to kobo
            currency: 'GHS',
            ref: 'EPC_' + Math.floor((Math.random() * 1000000000) + 1),
            metadata: {
                custom_fields: [
                    {
                        display_name: "Cart Items",
                        variable_name: "cart_items",
                        value: JSON.stringify(this.items.map(item => item.title))
                    }
                ]
            },
            callback: (response) => {
                this.handlePaymentResponse(response);
            },
            onClose: () => {
                console.log('Payment window closed');
            }
        });

        handler.openIframe();
    }

    calculateTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    handlePaymentResponse(response) {
        if (response.status === 'success') {
            // Clear cart
            this.items = [];
            this.updateCart();
            
            // Show success message
            alert('Payment successful! Your books will be delivered shortly.');
            
            // Close cart dropdown
            document.querySelector('.cart-dropdown').classList.remove('active');
        }
    }
}

// Initialize cart
const cart = new ShoppingCart();
