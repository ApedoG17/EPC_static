// Books & Resources E-commerce Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Book data storage (in a real app, this would come from a backend)
    const booksData = [
        {
            id: 'pmp-guide',
            title: 'PMP Certification Mastery Guide',
            category: 'pmp',
            digitalPrice: 49.99,
            physicalPrice: 69.99,
            formats: ['digital', 'physical'],
            description: 'Complete guide to passing the PMP exam on your first attempt. Includes practice questions and study strategies.',
            fileUrl: 'downloads/pmp-guide.pdf'
        },
        {
            id: 'ms-project-guide',
            title: 'Microsoft Project Complete Guide',
            category: 'ms-project',
            digitalPrice: 39.99,
            physicalPrice: null,
            formats: ['digital'],
            description: 'From basics to advanced features. Learn to plan, track, and manage projects effectively.',
            fileUrl: 'downloads/ms-project-guide.pdf'
        },
        {
            id: 'agile-handbook',
            title: 'Agile Project Management Handbook',
            category: 'agile',
            digitalPrice: 44.99,
            physicalPrice: 64.99,
            formats: ['digital', 'physical'],
            description: 'Master Scrum, Kanban, and Lean methodologies with practical examples and case studies.',
            fileUrl: 'downloads/agile-handbook.pdf'
        }
    ];

    // DOM Elements
    const filterButtons = document.querySelectorAll('.filter-btn');
    const bookCards = document.querySelectorAll('.book-card');
    const purchaseButtons = document.querySelectorAll('.purchase-btn');
    const paymentModal = document.getElementById('paymentModal');
    const successModal = document.getElementById('successModal');
    const closeModalButtons = document.querySelectorAll('.close-modal, .close-success-btn');
    const paymentMethodSelect = document.getElementById('paymentMethod');
    const deliveryTypeRadios = document.querySelectorAll('input[name="deliveryType"]');
    const paymentForm = document.getElementById('paymentForm');
    const bookUploadForm = document.getElementById('bookUploadForm');
    const adminSection = document.getElementById('adminSection');

    // Current selected book
    let selectedBook = null;

    // Filter Books by Category
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active filter button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter books
            bookCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Purchase Button Click
    purchaseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bookId = this.getAttribute('data-book');
            selectedBook = booksData.find(book => book.id === bookId);
            
            if (selectedBook) {
                openPaymentModal(selectedBook);
            }
        });
    });

    // Open Payment Modal
    function openPaymentModal(book) {
        document.getElementById('selectedBookTitle').textContent = book.title;
        updatePrice();
        paymentModal.style.display = 'block';
        
        // Reset form
        paymentForm.reset();
        showPaymentFields(''); // Hide all payment fields initially
    }

    // Update Price Based on Delivery Type
    function updatePrice() {
        const deliveryType = document.querySelector('input[name="deliveryType"]:checked').value;
        let price = 0;
        
        if (deliveryType === 'digital' && selectedBook) {
            price = selectedBook.digitalPrice;
        } else if (deliveryType === 'physical' && selectedBook) {
            price = selectedBook.physicalPrice || selectedBook.digitalPrice;
        }
        
        document.getElementById('finalPrice').textContent = price.toFixed(2);
    }

    // Delivery Type Change
    deliveryTypeRadios.forEach(radio => {
        radio.addEventListener('change', updatePrice);
        
        // Disable physical option if not available
        if (radio.value === 'physical' && selectedBook && !selectedBook.physicalPrice) {
            radio.disabled = true;
            radio.parentElement.style.opacity = '0.5';
        }
    });

    // Show/Hide Payment Fields Based on Method
    paymentMethodSelect.addEventListener('change', function() {
        showPaymentFields(this.value);
    });

    function showPaymentFields(method) {
        // Hide all payment fields
        document.querySelectorAll('.payment-fields').forEach(field => {
            field.style.display = 'none';
        });
        
        // Show relevant fields
        if (method === 'mtn' || method === 'telecel') {
            document.getElementById('mobileMoneyFields').style.display = 'block';
        } else if (method === 'visa' || method === 'mastercard') {
            document.getElementById('cardFields').style.display = 'block';
        } else if (method === 'bank') {
            document.getElementById('bankFields').style.display = 'block';
        }
    }

    // Payment Form Submission
    paymentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            bookId: selectedBook.id,
            bookTitle: selectedBook.title,
            customerName: document.getElementById('customerName').value,
            customerEmail: document.getElementById('customerEmail').value,
            deliveryType: document.querySelector('input[name="deliveryType"]:checked').value,
            paymentMethod: document.getElementById('paymentMethod').value,
            totalAmount: document.getElementById('finalPrice').textContent,
            timestamp: new Date().toISOString()
        };
        
        // Add payment-specific data
        if (formData.paymentMethod === 'mtn' || formData.paymentMethod === 'telecel') {
            formData.mobileNumber = document.getElementById('mobileNumber').value;
        } else if (formData.paymentMethod === 'bank') {
            formData.transactionRef = document.getElementById('transactionRef').value;
        }
        
        // Simulate payment processing
        processPayment(formData);
    });

    // Simulate Payment Processing
    function processPayment(paymentData) {
        const orderDetails = {
            email: paymentData.customerEmail,
            amount: parseFloat(paymentData.totalAmount),
            bookTitle: paymentData.bookTitle,
            bookId: paymentData.bookId,
            format: paymentData.deliveryType
        };

        // Initialize Paystack payment
        initializePaystack(orderDetails);
    }

    // Show Success Modal
    function showSuccessModal(paymentData) {
        paymentModal.style.display = 'none';
        
        const successMessage = document.getElementById('successMessage');
        const digitalDownload = document.getElementById('digitalDownload');
        const downloadLink = document.getElementById('downloadLink');
        
        if (paymentData.deliveryType === 'digital') {
            successMessage.textContent = `Thank you for your purchase! Your digital copy of "${paymentData.bookTitle}" is ready for download.`;
            digitalDownload.style.display = 'block';
            
            // Set download link (in real app, this would be a secure download URL)
            if (selectedBook) {
                downloadLink.href = selectedBook.fileUrl;
                downloadLink.setAttribute('download', `${selectedBook.title}.pdf`);
            }
        } else {
            successMessage.textContent = `Thank you for your purchase! Your printed copy of "${paymentData.bookTitle}" will be shipped to you within 3-5 business days.`;
            digitalDownload.style.display = 'none';
        }
        
        successModal.style.display = 'block';
        
        // Send confirmation email (simulated)
        sendConfirmationEmail(paymentData);
    }

    // Simulate Email Confirmation
    function sendConfirmationEmail(paymentData) {
        console.log('Sending confirmation email to:', paymentData.customerEmail);
        // In a real app, you would call your backend API here
    }

    // Close Modals
    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            paymentModal.style.display = 'none';
            successModal.style.display = 'none';
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === paymentModal) {
            paymentModal.style.display = 'none';
        }
        if (e.target === successModal) {
            successModal.style.display = 'none';
        }
    });

    // Admin Upload Functionality
    bookUploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('title', document.getElementById('bookTitle').value);
        formData.append('category', document.getElementById('bookCategory').value);
        formData.append('description', document.getElementById('bookDescription').value);
        formData.append('digitalPrice', document.getElementById('digitalPrice').value);
        formData.append('physicalPrice', document.getElementById('physicalPrice').value);
        
        const bookFile = document.getElementById('bookFile').files[0];
        const bookCover = document.getElementById('bookCover').files[0];
        
        if (bookFile) formData.append('bookFile', bookFile);
        if (bookCover) formData.append('bookCover', bookCover);
        
        uploadBook(formData);
    });

    // Simulate Book Upload
    function uploadBook(formData) {
        console.log('Uploading book:', Object.fromEntries(formData));
        
        // Simulate upload process
        setTimeout(() => {
            alert('Book uploaded successfully!');
            bookUploadForm.reset();
        }, 1500);
    }

    // Admin Authentication (Basic - for demo purposes)
    function checkAdminAccess() {
        // In a real app, this would check user authentication
        const isAdmin = localStorage.getItem('isAdmin') === 'true' || 
                       prompt('Enter admin password:') === 'admin123';
        
        if (isAdmin) {
            localStorage.setItem('isAdmin', 'true');
            adminSection.style.display = 'block';
        }
    }

    // Initialize admin access (remove this in production)
    // checkAdminAccess();

    // Utility Functions
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    // Input formatting for card fields
    document.getElementById('cardNumber')?.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ');
        if (formattedValue) {
            e.target.value = formattedValue;
        }
    });

    document.getElementById('expiryDate')?.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\//g, '').replace(/[^0-9]/gi, '');
        if (value.length >= 2) {
            e.target.value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
    });

    console.log('Books e-commerce system initialized');
});